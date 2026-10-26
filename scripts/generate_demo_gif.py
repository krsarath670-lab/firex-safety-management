import os
from PIL import Image, ImageDraw, ImageFont

artifact_dir = r"C:\Users\USER\.gemini\antigravity\brain\defede34-5da7-4cdd-b2e1-673bd45e8b88"
logo_path = os.path.join(artifact_dir, "firex_logo.png")

logo_img = None
if os.path.exists(logo_path):
    try:
        logo_img = Image.open(logo_path).convert("RGBA")
    except Exception as e:
        print("Could not load logo:", e)

WIDTH, HEIGHT = 1200, 675  # 16:9 widescreen format

def get_font(size, bold=False):
    # Try system fonts on Windows
    candidates = [
        r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibri.ttf"
    ]
    if bold:
        candidates = [
            r"C:\Windows\Fonts\segoeuib.ttf",
            r"C:\Windows\Fonts\arialbd.ttf",
            r"C:\Windows\Fonts\calibrib.ttf"
        ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except:
                pass
    return ImageFont.load_default()

font_title = get_font(42, bold=True)
font_subtitle = get_font(24, bold=True)
font_body = get_font(18, bold=False)
font_bold_body = get_font(18, bold=True)
font_small = get_font(15, bold=False)
font_mono = get_font(18, bold=True)

frames = []

def create_base_canvas(scene_num, scene_title):
    img = Image.new("RGBA", (WIDTH, HEIGHT), (15, 23, 42, 255)) # Dark slate bg
    draw = ImageDraw.Draw(img)
    
    # Top header bar
    draw.rectangle([(0, 0), (WIDTH, 70)], fill=(30, 41, 59, 255))
    draw.line([(0, 70), (WIDTH, 70)], fill=(225, 29, 72, 255), width=3) # Crimson line
    
    # Draw logo or badge
    if logo_img:
        logo_thumb = logo_img.copy()
        logo_thumb.thumbnail((120, 50), Image.Resampling.LANCZOS)
        img.paste(logo_thumb, (25, 12), logo_thumb)
    else:
        draw.text((25, 18), "FIREX", fill=(239, 68, 68), font=font_subtitle)
        
    draw.text((150, 22), "FireX Fire & Safety Service Management — Official Demo", fill=(241, 245, 249), font=font_subtitle)
    
    # Scene badge on top right
    draw.rounded_rectangle([(WIDTH - 260, 15), (WIDTH - 25, 55)], radius=8, fill=(225, 29, 72, 50), outline=(225, 29, 72))
    draw.text((WIDTH - 245, 24), f"SCENE {scene_num}: {scene_title.upper()}", fill=(254, 205, 211), font=font_small)
    
    # Bottom status bar
    draw.rectangle([(0, HEIGHT - 45), (WIDTH, HEIGHT)], fill=(15, 23, 42, 255))
    draw.line([(0, HEIGHT - 45), (WIDTH, HEIGHT - 45)], fill=(51, 65, 85, 255), width=1)
    draw.text((25, HEIGHT - 32), "Live Portal: https://firex-safety-management.onrender.com", fill=(148, 163, 184), font=font_small)
    draw.text((WIDTH - 320, HEIGHT - 32), "CR: 96850 1 | VAT: 220006271900002", fill=(148, 163, 184), font=font_small)
    
    return img, draw

# ----------------- SCENE 1: Welcome & Brand -----------------
for _ in range(2):
    img, draw = create_base_canvas(1, "Overview")
    # Content Card
    draw.rounded_rectangle([(80, 110), (WIDTH - 80, HEIGHT - 80)], radius=20, fill=(30, 41, 59, 255), outline=(51, 65, 85))
    draw.text((120, 140), "Welcome to FireX Fire & Safety Management", fill=(255, 255, 255), font=font_title)
    draw.text((120, 195), "Complete Enterprise Service Operations Platform • Kingdom of Bahrain", fill=(251, 191, 36), font=font_subtitle)
    
    # Features List
    features = [
        "✓ Clean, Simple & Mobile-Friendly Login Interface",
        "✓ 6-Character Alphanumeric Password Security with Brute-Force Rate Limiting",
        "✓ Accounts Role: Full System & Financial Access Equivalent to Admin",
        "✓ Admin Staff Management with Live Visible Passwords, Eye Toggle & 1-Click Copy",
        "✓ Multi-Building AMC Inspection Checklists (Separate Checklists per Building/Tower)",
        "✓ 10 Fire & Safety System Checklists (Alarm, Pumps, Hose Reel, Landing Valve, Extinguishers...)",
        "✓ Emergency Call-Outs & Instant Print-Ready PDF Reports with Company Letterhead"
    ]
    y = 250
    for f in features:
        draw.text((120, y), f, fill=(226, 232, 240), font=font_body)
        y += 42
    frames.append(img)

# ----------------- SCENE 2: Simple Login & 6-Char Password -----------------
for _ in range(2):
    img, draw = create_base_canvas(2, "Simple Login")
    # Simulated mobile/laptop modal
    draw.rounded_rectangle([(340, 100), (860, HEIGHT - 75)], radius=20, fill=(255, 255, 255, 255), outline=(203, 213, 225))
    
    draw.text((450, 130), "FireX Service Portal", fill=(15, 23, 42), font=font_subtitle)
    draw.text((430, 165), "Sign in with assigned credentials", fill=(100, 116, 139), font=font_small)
    
    # Username box
    draw.text((380, 205), "USERNAME", fill=(71, 85, 105), font=font_small)
    draw.rounded_rectangle([(380, 225), (820, 265)], radius=8, fill=(248, 250, 252), outline=(203, 213, 225))
    draw.text((395, 235), "admin", fill=(15, 23, 42), font=font_mono)
    
    # Password box
    draw.text((380, 280), "PASSWORD (EXACTLY 6 CHARACTERS)", fill=(71, 85, 105), font=font_small)
    draw.rounded_rectangle([(380, 300), (820, 340)], radius=8, fill=(248, 250, 252), outline=(203, 213, 225))
    draw.text((395, 310), "FX7B2K", fill=(15, 23, 42), font=font_mono)
    draw.text((770, 310), "[👁️]", fill=(148, 163, 184), font=font_small)
    
    # Login Button
    draw.rounded_rectangle([(380, 360), (820, 405)], radius=10, fill=(225, 29, 72), outline=(190, 18, 60))
    draw.text((550, 372), "SIGN IN", fill=(255, 255, 255), font=font_bold_body)
    
    # Security Callout
    draw.rounded_rectangle([(380, 425), (820, 520)], radius=10, fill=(254, 243, 199), outline=(252, 211, 77))
    draw.text((395, 435), "🛡️ Security & Brute-Force Rate Limiting:", fill=(180, 83, 9), font=font_bold_body)
    draw.text((395, 465), "• 6-character alphanumeric rule strictly validated on all accounts.", fill=(146, 64, 14), font=font_small)
    draw.text((395, 490), "• 5 failed attempts trigger an automatic 15-minute temporary lockout.", fill=(146, 64, 14), font=font_small)
    frames.append(img)

# ----------------- SCENE 3: Executive Dashboard & Accounts Access -----------------
for _ in range(2):
    img, draw = create_base_canvas(3, "Dashboard & Access")
    # Left stats cards
    stats = [
        ("ACTIVE AMC CONTRACTS", "48 Contracts", "100% Active & Compliant", (220, 252, 231), (22, 101, 52)),
        ("Q1 SCHEDULED VISITS", "32 Visits", "24 Completed | 8 Upcoming", (224, 242, 254), (7, 89, 133)),
        ("ACTIVE EMERGENCY CALLS", "5 Jobs", "Average Response: 28 mins", (254, 243, 199), (146, 64, 14)),
        ("TOTAL COVERED SITES", "114 Buildings", "Commercial, Hotels, Industrial", (243, 232, 255), (107, 33, 168))
    ]
    
    x, y = 80, 110
    for title, val, sub, bg, fg in stats:
        draw.rounded_rectangle([(x, y), (x + 480, y + 105)], radius=12, fill=bg, outline=(203, 213, 225))
        draw.text((x + 20, y + 15), title, fill=(100, 116, 139), font=font_small)
        draw.text((x + 20, y + 38), val, fill=fg, font=font_subtitle)
        draw.text((x + 20, y + 75), sub, fill=(71, 85, 105), font=font_small)
        y += 120
        
    # Right panel: Accounts & Admin full access badge
    draw.rounded_rectangle([(600, 110), (WIDTH - 80, HEIGHT - 80)], radius=15, fill=(30, 41, 59), outline=(51, 65, 85))
    draw.text((630, 140), "Full Application Permissions", fill=(255, 255, 255), font=font_subtitle)
    draw.text((630, 175), "Accounts Role = Complete Admin Equivalency", fill=(45, 212, 191), font=font_bold_body)
    
    perms = [
        "✓ View & manage all 48 customer contracts",
        "✓ Full access to invoices, payments & balances",
        "✓ Create & review AMC checklists and reports",
        "✓ Dispatch breakdown emergency call-outs",
        "✓ Full staff directory & permissions access",
        "✓ Company settings & letterhead configuration"
    ]
    py = 220
    for p in perms:
        draw.text((630, py), p, fill=(226, 232, 240), font=font_body)
        py += 40
    frames.append(img)

# ----------------- SCENE 4: Staff Passwords for Admin -----------------
for _ in range(2):
    img, draw = create_base_canvas(4, "Staff Passwords")
    draw.text((80, 95), "Staff Credentials Management (Visible to Administrator)", fill=(255, 255, 255), font=font_subtitle)
    draw.text((80, 125), "Admin can view, reveal, copy, or reset 6-character passwords with 1 click.", fill=(148, 163, 184), font=font_small)
    
    # 4 Sample staff cards
    cards = [
        ("Admin", "@admin", "System Administrator", "FX7B2K", (225, 29, 72)),
        ("Wissam Jamal Hussein", "@md", "Managing Director (MD)", "F8B3PU", (217, 119, 6)),
        ("Yaser Zidan", "@yaser", "Accounts Manager", "U2NMC3", (13, 148, 136)),
        ("Sarath Kr", "@sarath", "Senior Field Supervisor", "EX8DS2", (37, 99, 235)),
        ("Chandiramohan", "@Chandiramohan", "Projects Manager", "7FB6DK", (14, 116, 144)),
        ("Abdul majeed", "@Abdulmajeed", "Certified Technician", "G76JER", (5, 150, 105))
    ]
    
    col_w, row_h = 500, 110
    coords = [
        (80, 160), (620, 160),
        (80, 290), (620, 290),
        (80, 420), (620, 420)
    ]
    
    for (name, uname, role, pwd, col), (cx, cy) in zip(cards, coords):
        draw.rounded_rectangle([(cx, cy), (cx + col_w, cy + row_h)], radius=12, fill=(255, 255, 255), outline=(203, 213, 225))
        draw.text((cx + 15, cy + 15), name, fill=(15, 23, 42), font=font_bold_body)
        draw.text((cx + 15, cy + 38), f"{uname} • {role}", fill=(100, 116, 139), font=font_small)
        
        # Password Badge
        draw.rounded_rectangle([(cx + 15, cy + 65), (cx + col_w - 15, cy + 100)], radius=6, fill=(254, 243, 199), outline=(252, 211, 77))
        draw.text((cx + 25, cy + 73), "Password: ", fill=(146, 64, 14), font=font_small)
        draw.text((cx + 105, cy + 71), pwd, fill=(15, 23, 42), font=font_mono)
        
        # Copy button pill
        draw.rounded_rectangle([(cx + col_w - 95, cy + 69), (cx + col_w - 25, cy + 96)], radius=4, fill=(255, 255, 255), outline=(203, 213, 225))
        draw.text((cx + col_w - 85, cy + 74), "📋 Copy", fill=(15, 23, 42), font=font_small)
    frames.append(img)

# ----------------- SCENE 5: Multi-Building AMC & 10 Systems -----------------
for _ in range(2):
    img, draw = create_base_canvas(5, "Multi-Building AMC")
    
    # Left: Building Selector Tabs
    draw.rounded_rectangle([(80, 100), (450, HEIGHT - 80)], radius=15, fill=(30, 41, 59), outline=(51, 65, 85))
    draw.text((105, 120), "Customer: Emaar Hospitality", fill=(255, 255, 255), font=font_bold_body)
    draw.text((105, 145), "Site: ABC Complex (3 Buildings)", fill=(148, 163, 184), font=font_small)
    
    draw.text((105, 185), "SELECT BUILDING FOR VISIT:", fill=(251, 191, 36), font=font_small)
    
    bldgs = [
        ("🏢 Building 1 — Tower A", True),
        ("🏢 Building 2 — Tower B", False),
        ("🅿️ Building 3 — Parking Block", False)
    ]
    by = 215
    for bname, sel in bldgs:
        bg = (225, 29, 72) if sel else (51, 65, 85)
        draw.rounded_rectangle([(105, by), (425, by + 45)], radius=8, fill=bg)
        draw.text((120, by + 12), bname, fill=(255, 255, 255), font=font_body)
        by += 60
        
    draw.text((105, by + 20), "⚠️ Each building has its OWN", fill=(248, 113, 113), font=font_small)
    draw.text((105, by + 42), "separate checklist & results.", fill=(248, 113, 113), font=font_small)
    
    # Right: 10 Systems Checklist
    draw.rounded_rectangle([(475, 100), (WIDTH - 80, HEIGHT - 80)], radius=15, fill=(255, 255, 255), outline=(203, 213, 225))
    draw.text((500, 120), "Tower A — 10 Safety Systems Checklist", fill=(15, 23, 42), font=font_subtitle)
    
    items = [
        ("1. Fire Alarm System (Main FACP, Loop Sensitivities)", "OK"),
        ("2. Fire Fighting Pumps (Main, Standby, Jockey PSI)", "OK"),
        ("3. Fire Hose Reel (Valve Pressure, Reel Rewind)", "OK"),
        ("4. Landing Valve (Gasket, Hydrostatic Seal)", "OK"),
        ("5. Portable Extinguishers (CO2, DCP, Pressure Gauges)", "OK"),
        ("6. FM200 Clean Agent Suppression (Actuator & Cylinder)", "OK"),
        ("7. LPG Gas Leak Detection (Sensors & Solenoid Shutoff)", "OK"),
        ("8. Emergency & Exit Lighting (90-Minute Battery Test)", "OK")
    ]
    
    iy = 165
    for desc, res in items:
        draw.rounded_rectangle([(500, iy), (WIDTH - 105, iy + 36)], radius=6, fill=(248, 250, 252), outline=(226, 232, 240))
        draw.text((515, iy + 9), desc, fill=(30, 41, 59), font=font_small)
        draw.rounded_rectangle([(WIDTH - 155, iy + 5), (WIDTH - 115, iy + 31)], radius=4, fill=(220, 252, 231))
        draw.text((WIDTH - 145, iy + 8), res, fill=(22, 101, 52), font=font_small)
        iy += 44
    frames.append(img)

# ----------------- SCENE 6: Emergency & PDF Generation -----------------
for _ in range(2):
    img, draw = create_base_canvas(6, "PDF Report Export")
    
    # Left simulated PDF
    draw.rounded_rectangle([(80, 100), (700, HEIGHT - 80)], radius=15, fill=(255, 255, 255), outline=(203, 213, 225))
    
    # Header banner
    draw.rectangle([(80, 100), (700, 160)], fill=(248, 250, 252))
    draw.line([(80, 160), (700, 160)], fill=(225, 29, 72), width=3)
    draw.text((105, 115), "FIREX FIRE & SAFETY SERVICES BAHRAIN", fill=(225, 29, 72), font=font_subtitle)
    draw.text((105, 142), "Official Service & Inspection Report • CR No. 96850 1", fill=(100, 116, 139), font=font_small)
    
    draw.text((105, 180), "CLIENT: Emaar Hospitality Group", fill=(15, 23, 42), font=font_bold_body)
    draw.text((105, 205), "SITE: ABC Complex (Tower A & B)", fill=(71, 85, 105), font=font_body)
    draw.text((450, 180), "REPORT #: RPT-2026-0042", fill=(15, 23, 42), font=font_bold_body)
    draw.text((450, 205), "DATE: 15-OCT-2026", fill=(71, 85, 105), font=font_body)
    
    draw.rounded_rectangle([(105, 240), (675, 330)], radius=8, fill=(248, 250, 252), outline=(226, 232, 240))
    draw.text((120, 250), "Inspection Findings & Corrective Action:", fill=(15, 23, 42), font=font_bold_body)
    draw.text((120, 275), "• Zone 3 optical smoke detector replaced with genuine FX-SD02 unit.", fill=(51, 65, 85), font=font_small)
    draw.text((120, 298), "• FACP secondary backup battery load tested — all systems normal.", fill=(51, 65, 85), font=font_small)
    
    # Signatures
    draw.text((120, 360), "Technician: Ahmed Mohammed (Signed)", fill=(30, 58, 138), font=font_body)
    draw.text((120, 395), "Supervisor: Sarath Kr (Approved)", fill=(30, 58, 138), font=font_body)
    draw.text((450, 375), "[OFFICIAL FIREX STAMP]", fill=(225, 29, 72), font=font_bold_body)
    
    # Right callout panel
    draw.rounded_rectangle([(730, 100), (WIDTH - 80, HEIGHT - 80)], radius=15, fill=(30, 41, 59), outline=(51, 65, 85))
    draw.text((755, 130), "One-Click Branded PDF", fill=(255, 255, 255), font=font_subtitle)
    draw.text((755, 170), "Instant export ready for:", fill=(251, 191, 36), font=font_body)
    
    uses = [
        "• Civil Defence compliance audits",
        "• Client handover and invoicing",
        "• Technical service records",
        "• Mobile device WhatsApp sharing",
        "• High-resolution printout"
    ]
    uy = 210
    for u in uses:
        draw.text((755, uy), u, fill=(226, 232, 240), font=font_body)
        uy += 40
        
    draw.rounded_rectangle([(755, uy + 10), (WIDTH - 105, uy + 65)], radius=8, fill=(22, 163, 74))
    draw.text((780, uy + 25), "✓ PDF Ready & Certified", fill=(255, 255, 255), font=font_bold_body)
    frames.append(img)

# Save animated GIF
gif_path = os.path.join(artifact_dir, "FireX_Demo_Walkthrough.gif")
frames[0].save(
    gif_path,
    save_all=True,
    append_images=frames[1:],
    duration=2500, # 2.5 seconds per slide
    loop=0
)
print("Successfully saved animated Demo Walkthrough GIF to:", gif_path)
