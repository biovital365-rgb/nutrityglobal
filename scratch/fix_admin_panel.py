import os

file_path = r"c:\Files ECOTRAFFIC\PROYECTOS 2026\BioVital 365\app Nutrity Global\src\components\AdminPanel.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Normalize newlines for processing, keeping track of original line ending style
use_crlf = "\r\n" in content
normalized = content.replace("\r\n", "\n")

# 1. Delete first duplicate/corrupt block from first {section === "menu" && (
# to the second {section === "menu" && (
menu_indicator = '                {section === "menu" && ('
first_idx = normalized.find(menu_indicator)
second_idx = normalized.find(menu_indicator, first_idx + len(menu_indicator))

if first_idx != -1 and second_idx != -1:
    print(f"Found first menu block at index {first_idx} and second at index {second_idx}. Removing duplicate/corrupt section...")
    normalized = normalized[:first_idx] + normalized[second_idx:]
else:
    print("Error: Could not locate both menu section blocks.")

# 2. Delete the stray reject-handler lines under the first "Notas del coach" comment
stray_indicator = "                                          {/* Notas del coach */}\n                                                                 const weekStart = menuWeekDays[0]?.weekStart;"
real_indicator = "                                         {/* Notas del coach */}\n                                         <div className=\"p-4 bg-white"

stray_idx = normalized.find(stray_indicator)
real_idx = normalized.find(real_indicator)

if stray_idx != -1 and real_idx != -1:
    print(f"Found stray coach notes block at index {stray_idx} and real block at index {real_idx}. Removing stray code...")
    normalized = normalized[:stray_idx] + normalized[real_idx:]
else:
    # Try alternate spacing/indicators if needed
    alt_indicator = "                                          {/* Notas del coach */}"
    alt_first = normalized.find(alt_indicator)
    alt_second = normalized.find("                                         {/* Notas del coach */}")
    if alt_first != -1 and alt_second != -1 and alt_first < alt_second:
        print(f"Removing stray coach notes block between alt indexes {alt_first} and {alt_second}...")
        normalized = normalized[:alt_first] + normalized[alt_second:]
    else:
        print("Error: Could not locate stray coach notes block.")

# 3. Replace the loading state block
loading_target = """                                        {/* Días del menú */}
                                        {isLoadingMenu ? (
                                            </div>
                                        ) : ("""

loading_replacement = """                                        {/* Días del menú */}
                                        {isLoadingMenu ? (
                                            <div className="h-48 flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-nutrity-accent" />
                                            </div>
                                        ) : ("""

if loading_target in normalized:
    print("Replacing loading state block...")
    normalized = normalized.replace(loading_target, loading_replacement)
else:
    # Try with single-space variance or normalize spaces
    print("Warning: Direct match for loading state target not found. Attempting fuzzy match...")
    import re
    pattern = r"\{\/\* Días del menú \*\/\}\s*\{\s*isLoadingMenu\s*\?\s*\(\s*</div>\s*\)\s*:\s*\("
    normalized, count = re.subn(pattern, '/* Días del menú */}\n                                        {isLoadingMenu ? (\n                                            <div className="h-48 flex items-center justify-center">\n                                                <Loader2 className="w-8 h-8 animate-spin text-nutrity-accent" />\n                                            </div>\n                                        ) : (', normalized)
    print(f"Fuzzy replaced {count} occurrences of loading state.")

# Restore newlines
final_content = normalized.replace("\n", "\r\n") if use_crlf else normalized

with open(file_path, "w", encoding="utf-8") as f:
    f.write(final_content)

print("Modification script completed.")
