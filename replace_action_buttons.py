import os
import re

directory = "frontend/src/pages/"

replacements = [
    # Revert the long ones from EmpresasPage.jsx
    (r'className="flex items-center gap-1\.5 rounded-lg border border-slate-200 bg-white px-2\.5 py-1\.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"', r'className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-amber-400 shadow-sm transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600"'),
    (r'className="flex items-center gap-1\.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2\.5 py-1\.5 text-xs font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-100 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"', r'className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-amber-400 shadow-sm transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600"'),
    (r'className="flex items-center gap-1\.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2\.5 py-1\.5 text-xs font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-100 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"', r'className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-amber-400 shadow-sm transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600"'),
    (r'className="flex items-center gap-1\.5 rounded-lg border border-rose-200 bg-rose-50 px-2\.5 py-1\.5 text-xs font-medium text-rose-700 shadow-sm transition hover:bg-rose-100 hover:text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300"', r'className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-amber-400 shadow-sm transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600"'),

    # The small action buttons in other pages
    (r'className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-white"', r'className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-bold text-amber-400 hover:bg-slate-900 transition"'),
    (r'className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-semibold text-white"', r'className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-bold text-amber-400 hover:bg-slate-900 transition"'),
    (r'className="rounded-lg bg-indigo-600 px-2 py-1 text-xs text-white"', r'className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-bold text-amber-400 hover:bg-slate-900 transition"'),
    (r'className="rounded-lg bg-rose-600 px-2 py-1 text-xs text-white"', r'className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-bold text-amber-400 hover:bg-slate-900 transition"'),
    (r'className="rounded-lg bg-emerald-600 px-2 py-1 text-xs text-white"', r'className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-bold text-amber-400 hover:bg-slate-900 transition"'),
    (r'className="rounded-lg bg-teal-600 px-2 py-1 text-xs text-white"', r'className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-bold text-amber-400 hover:bg-slate-900 transition"'),

    # Some might use padding like px-3 py-1.5 
    (r'className="rounded-lg bg-indigo-600 px-3 py-1\.5 text-xs font-semibold text-white"', r'className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-slate-900 transition"'),
]

for filename in os.listdir(directory):
    if filename.endswith(".jsx"):
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        for old, new in replacements:
            new_content = re.sub(old, new, new_content)
            
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated action buttons in {filename}")
