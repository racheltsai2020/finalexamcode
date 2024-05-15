from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import test
import threading
import sys

app = Flask(__name__)
CORS(app)

def isPython(file_path):
    try:
        with open(file_path, 'r') as file:
            code = file.read()
            compile(code, file_path, 'exec')
            return True
    except Exception as e:
        return False

@app.route('/upload', methods=['POST'])
def handle_file():

    if 'file' in request.files:
        uploaded_file = request.files['file']
        if uploaded_file.filename != '':
            file_path = os.path.join('./','solution.py')
            uploaded_file.save(file_path)

        
    if 'text' in request.form:
        text_content = request.form['text']
        if text_content.strip():
            with open(os.path.join('./','solution.py'), 'w') as text_file:
                text_file.write(text_content)

    return jsonify({'message': 'Data processed successfully'})

def run_test(test_func):

    result = {
                'test_name': test_func.__name__,
                'status': 'FAILED',
                'execution_time_ms': 'N/A'
            }
    
    def timeout_status(): 
        nonlocal result   
        start_time = time.time()
        
        try:
            test_func()
            runtime = (time.time() - start_time) * 1000
            result = {
                'test_name': test_func.__name__,
                'status': 'PASSED',
                'execution_time_ms': f"{runtime: .2f}"
            }
        except AssertionError:
            result = {
            'test_name': test_func.__name__,
            'status': 'FAILED',
            'execution_time_ms': "N/A"
            }
        except Exception:
            result = {
            'test_name': test_func.__name__,
            'status': 'FAILED (Compile error or the code provided is not in python)',
            'execution_time_ms': 'N/A'
            }
        finally:
            runtime = (time.time() - start_time) * 1000
        
    thread = threading.Thread(target=timeout_status)
    thread.start()
    thread.join(0.2)

    if thread.is_alive():
        runtime = (2) * 1000
        result ={
                'test_name': test_func.__name__,
                'status': 'FAILED (Took more than 2 seconds to run)',
                'execution_time_ms': f"{runtime: .2f}"
        }
    return result

    




@app.route('/runTest', methods=['GET'])
def execute_test():
    test_results = []

    if not isPython('./solution.py'):
        return jsonify({'score': 0})

    test_functions = [
        getattr(test, func_name) for func_name in dir(test)
        if func_name.startswith('test_') and callable(getattr(test,func_name))
    ]
    
    pass_test = 0

    for test_func in test_functions:
        result = run_test(test_func)
        test_results.append(result)
        if result['status'] == 'PASSED':
            pass_test += 1
    
    total_test = len(test_functions)
    score = (pass_test/total_test) * 100
    
    return jsonify({'test_results': test_results, 'score': score})
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
