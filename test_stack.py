from fastapi import FastAPI, Depends
import inspect
import asyncio

class Session:
    pass

class AsyncSession:
    pass

app = FastAPI()

async def get_db():
    frame = inspect.currentframe()
    is_async_endpoint = False
    endpoint_name = "unknown"
    while frame:
        locals_dict = frame.f_locals
        if "dependant" in locals_dict:
            dep = locals_dict["dependant"]
            if hasattr(dep, "call") and dep.call:
                endpoint = dep.call
                endpoint_name = endpoint.__name__
                try:
                    sig = inspect.signature(endpoint)
                    for param_name, param in sig.parameters.items():
                        annotation_str = str(param.annotation)
                        if "AsyncSession" in annotation_str:
                            is_async_endpoint = True
                            break
                except Exception as e:
                    print(f"Error inspecting signature: {e}")
                break
        frame = frame.f_back
    
    print(f"[DEBUG] get_db called for endpoint: {endpoint_name}, expects AsyncSession: {is_async_endpoint}")
    yield "async_session" if is_async_endpoint else "sync_session"

@app.get("/sync-def")
def sync_def_route(db: Session = Depends(get_db)):
    return {"db": db}

@app.get("/sync-async-def")
async def sync_async_def_route(db: Session = Depends(get_db)):
    return {"db": db}

@app.get("/async-route")
async def async_route(db: AsyncSession = Depends(get_db)):
    return {"db": db}

if __name__ == "__main__":
    from fastapi.testclient import TestClient
    client = TestClient(app)
    print("Testing /sync-def:")
    print(client.get("/sync-def").json())
    print("\nTesting /sync-async-def:")
    print(client.get("/sync-async-def").json())
    print("\nTesting /async-route:")
    print(client.get("/async-route").json())
