Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param(
        [string]$sourcePath,
        [string]$targetPath,
        [int]$width,
        [int]$height
    )
    $src = [System.Drawing.Image]::FromFile($sourcePath)
    $dest = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Fill background with nice navy or white
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 15, 30, 54))
    $g.FillRectangle($brush, 0, 0, $width, $height)
    
    # Draw logo centered with padding
    $pad = [int]($width * 0.1)
    $drawW = $width - ($pad * 2)
    $drawH = $height - ($pad * 2)
    $g.DrawImage($src, $pad, $pad, $drawW, $drawH)
    
    $dest.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $dest.Dispose()
    $src.Dispose()
    Write-Host "Created $targetPath ($width x $height)"
}

$logoPath = "C:\Users\USER\.gemini\antigravity\scratch\fire-safety-app\public\logo.png"
Resize-Image -sourcePath $logoPath -targetPath "C:\Users\USER\.gemini\antigravity\scratch\fire-safety-app\public\icon-192.png" -width 192 -height 192
Resize-Image -sourcePath $logoPath -targetPath "C:\Users\USER\.gemini\antigravity\scratch\fire-safety-app\public\icon-512.png" -width 512 -height 512
Resize-Image -sourcePath $logoPath -targetPath "C:\Users\USER\.gemini\antigravity\scratch\fire-safety-app\public\apple-touch-icon.png" -width 180 -height 180
