from PIL import Image
img = Image.open('assets/icon.png').convert('RGBA')
bg = Image.new('RGB', img.size, (222, 218, 210))
bg.paste(img, mask=img.split()[3])
bg.save('assets/icon.png')
print('Fixed')  