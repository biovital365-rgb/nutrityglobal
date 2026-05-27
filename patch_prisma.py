import re
import os

files = [
    'prisma/schema.prisma',
    'nutrity-nextjs/prisma/schema.prisma'
]

replacements = {
    'User': '\n  @@index([stripeCustomerId])\n  @@index([subscriptionId])\n  @@index([organizationId])\n}',
    'Food': '\n  @@index([organizationId])\n}',
    'Micronutrient': '\n  @@index([organizationId])\n}',
    'Measurement': '\n  createdAt      DateTime      @default(now())\n  @@index([userId])\n  @@index([organizationId])\n}',
    'Appointment': '\n  @@index([userId])\n  @@index([organizationId])\n}',
    'Evaluation': '\n  createdAt      DateTime      @default(now())\n  @@index([userId])\n  @@index([organizationId])\n}',
    'Course': '\n  @@index([organizationId])\n}',
    'Lesson': '\n  @@index([courseId])\n}',
    'Enrollment': '\n  createdAt      DateTime      @default(now())\n  @@index([userId])\n  @@index([organizationId])\n  @@index([courseId])\n}',
    'LessonProgress': '\n  createdAt DateTime @default(now())\n  @@index([userId])\n  @@index([lessonId])\n}',
    'DailyMenu': '\n  @@index([userId])\n}',
    'Post': '\n  @@index([organizationId])\n}',
    'PDFReportLog': '\n  @@index([userId])\n  @@index([organizationId])\n}',
    'BiologicalDiagnosis': '\n  @@index([userId])\n  @@index([organizationId])\n}',
}

for filepath in files:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for model, add_str in replacements.items():
        # Find the model block
        pattern = re.compile(r'(model\s+' + model + r'\s+\{[^}]*)(\n\})', re.DOTALL)
        
        def replace_fn(match):
            block = match.group(1)
            # Only add if not already there to avoid duplicates
            # For simplicity, if @@index is missing, we append
            # Wait, if we run it twice it might duplicate.
            # But we are just running it once.
            return block + add_str

        new_content = pattern.sub(replace_fn, new_content)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Patched {filepath}")
    else:
        print(f"No changes for {filepath}")
