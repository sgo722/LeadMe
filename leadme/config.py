import os

ENV = os.environ.get('ENV', 'dev')

if ENV == 'dev':
    FILE_STORAGE_PATH = 'C:/leadme'
else:
    FILE_STORAGE_PATH = '/home/ubuntu/python'

os.makedirs(FILE_STORAGE_PATH, exist_ok=True)

try:
    os.makedirs(FILE_STORAGE_PATH, exist_ok=True)
    print(f"Directory {FILE_STORAGE_PATH} created successfully.")
except PermissionError:
    print(f"PermissionError: Unable to create directory at {FILE_STORAGE_PATH}.")
except Exception as e:
    print(f"Error: {e}")


# 파일 경로에서 디렉토리 부분을 추출하고, 해당 디렉토리가 없으면 생성
def ensure_dir(file_path):
    directory = os.path.dirname(file_path)
    if not os.path.exists(directory):
        os.makedirs(directory)

# 파일 저장 함수
def save_file(filename, content):
    full_path = os.path.join(FILE_STORAGE_PATH, filename)
    ensure_dir(full_path)
    with open(full_path, 'w') as f:
        f.write(content)        

