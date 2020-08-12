import sys
import requests
import shutil
from PIL import Image

HOST = 'https://rtex.probablyaweb.site'

LATEX = r'{}'.format(sys.argv[1])

def download_file(url, dest_filename):
	response = requests.get(url, stream = True)
	response.raise_for_status()
	with open(dest_filename, 'wb') as out_file:
		shutil.copyfileobj(response.raw, out_file)

def render_latex(output_format, latex, dest_filename):
	payload = {'code': latex, 'format': output_format}
	response = requests.post(HOST + '/api/v2', data = payload)
	response.raise_for_status()
	jdata = response.json()
	if jdata['status'] != 'success':
		raise Exception('Failed to render LaTeX')
	url = HOST + '/api/v2/' + jdata['filename']
	download_file(url, dest_filename)

render_latex('png', LATEX, './out.png')

# Remove transparent background by pasting

img = Image.open('out.png').convert('RGBA')
width, height = img.size
bg = Image.new('RGBA', (width, height), (255, 255, 255, 255))
bg.paste(img, (0, 0), mask=img)
bg.save('out.png', format='png')
sys.stdout.write('done')