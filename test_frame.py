from fastapi import FastAPI, Depends
import inspect
import asyncio

app = FastAPI()

def get_db():
    frame = inspect.currentframe()
    is_async_endpoint = False
    endpoint_name = "unknown"
    while frame:
        code = frame.f_code
        locals_dict = frame.f_locals
        # Check if we are in solve_dependencies
        if code.co_name == "solve_dependencies" or "dependant" in locals_dict:
            if "dependant" in locals_dict:
                dep = locals_dict["dependant"]
                if hasattr(dep, "call") and dep.call:
                    endpoint_name = dep.call.__name__
                    if asyncio.iscoroutinefunction(dep.call):
                        is_async_endpoint = True
                    break
        frame = frame.f_back
    
    print(f"[DEBUG] get_db called for endpoint: {endpoint_name}, is_async: {is_async_endpoint}")
    yield "async_session" if is_async_endpoint else "sync_session"

@app.get("/sync")
def sync_route(db = Depends(get_db)):
    return {"db": db}

@app.get("/async")
async def async_route(db = Depends(get_db)):
    return {"db": db}

if __name__ == "__main__":
    from fastapi.testclient import TestClient
    client = TestClient(app)
    print("Testing /sync:")
    print(client.get("/sync").json())
    print("\nTesting /async:")
    print(client.get("/async").json())
