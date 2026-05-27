from app.schemas.schemas import EmpresaResponseGet

print("Fields in EmpresaResponseGet:")
for name, field in EmpresaResponseGet.model_fields.items():
    print(f"- {name}: {field.annotation}")
