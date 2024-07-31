import tempfile, uuid, os, atexit
from flask import Flask, request, send_file, url_for, render_template
from colorama import Fore
from colorama import init as colorama_init

colorama_init(autoreset=True)

app = Flask(__name__)

file_storage = {}

def cleanup_temp_files():
    print(Fore.GREEN + "Cleaning up files" + Fore.RESET)
    for file_path, _ in file_storage.values():
        if os.path.exists(file_path):
            os.remove(file_path)
    file_storage.clear()

atexit.register(cleanup_temp_files)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part'
    file = request.files['file']
    if file.filename == '':
        return 'No selected file'
    
    if file:
        unique_id = str(uuid.uuid4())
        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1])
        try:
            file.save(temp_file.name)
            
            file_storage[unique_id] = (temp_file.name, file.filename)
            
            download_link = url_for('download_page', file_id=unique_id, _external=True)
            
            print(Fore.CYAN + f'A file was uploaded: {file.filename} | {download_link}' + Fore.RESET)
            return {
                'fileName': file.filename,
                'downloadLink': download_link,
                'success': True
            }
        finally:
            temp_file.close()
        
@app.route('/download/<file_id>', methods=['GET'])
def download_file(file_id):
    if file_id in file_storage:
        file_path, filename = file_storage[file_id]
        return send_file(file_path, as_attachment=True, download_name=filename)
    else:
        return 'File not found'

@app.route('/download_page/<file_id>', methods=['GET'])
def download_page(file_id):
    if file_id in file_storage:
        file_path, filename = file_storage[file_id]
        download_link = url_for('download_file', file_id=file_id, _external=True)
        return render_template('download_page.html', filename=filename, download_link=download_link)
    else:
        return 'File not found'

if __name__ == '__main__':
    app.run(host='25.4.81.1', port=5000)