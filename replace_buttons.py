import os
import re

directory = "frontend/src/pages/"

replacements = [
    (r'bg-teal-600 px-4 py-2 text-white', r'bg-slate-800 px-4 py-2 text-amber-400 font-bold border border-slate-700 hover:bg-slate-900'),
    (r'bg-indigo-600 px-4 py-2 text-white', r'bg-slate-800 px-4 py-2 text-amber-400 font-bold border border-slate-700 hover:bg-slate-900'),
    (r'bg-slate-900 px-4 py-2 text-white', r'bg-slate-800 px-4 py-2 text-amber-400 font-bold border border-slate-700 hover:bg-slate-900'),
    (r'bg-teal-600 px-4 py-2\.5 font-semibold text-white hover:bg-teal-700', r'bg-slate-800 px-4 py-2.5 font-bold text-amber-400 border border-slate-700 hover:bg-slate-900'),
    (r'bg-indigo-600 px-4 py-2\.5 font-semibold text-white hover:bg-indigo-700', r'bg-slate-800 px-4 py-2.5 font-bold text-amber-400 border border-slate-700 hover:bg-slate-900'),
    (r'bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700', r'bg-slate-800 px-4 py-2 text-sm font-bold text-amber-400 border border-slate-700 hover:bg-slate-900'),
    (r'bg-slate-900 px-4 py-2\.5 font-semibold text-white hover:bg-slate-800', r'bg-slate-800 px-4 py-2.5 font-bold text-amber-400 border border-slate-700 hover:bg-slate-900'),
    (r'bg-teal-600 px-4 py-2\.5 font-semibold text-white', r'bg-slate-800 px-4 py-2.5 font-bold text-amber-400 border border-slate-700 hover:bg-slate-900'),
    (r'bg-indigo-600 px-4 py-2\.5 font-semibold text-white', r'bg-slate-800 px-4 py-2.5 font-bold text-amber-400 border border-slate-700 hover:bg-slate-900'),
    (r'bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700', r'bg-slate-800 px-4 py-2 font-bold text-amber-400 border border-slate-700 hover:bg-slate-900'),
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
            print(f"Updated {filename}")
