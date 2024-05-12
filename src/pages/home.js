import React, {useState} from 'react';
import chess from '../chess.png';
import {useNavigate} from 'react-router-dom';

const Home = ({signOut, user}) => {
    const [file, setFile] = useState(null);
    const [input, setInput] = useState('');
    const navigate = useNavigate();

    const fileUpload = (event) => {
        const uploadFile = event.target.files[0];
        if(uploadFile){
            setFile(uploadFile);
        }
        else{
            setFile(null);
        }
    };

    const inputChange = (event) => {
        setInput(event.target.value);
    };

    const submit = async () => {
        try{
            const formData = new FormData();
            if(file) {
                formData.append('file', file);
            } else {
                formData.append('text', input);
            }

            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            if(!response.ok){
                throw new Error('Failed to fetch');
            }
            const data = await response.json();
            console.log(data);
            navigate('/result');
        } catch (error){
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <h1>Auto Grader System</h1>
            <h3>Welcome, {user.signInDetails.loginId}: <button onClick={signOut}>Logout</button></h3>
            <p>Upload a python file or enter the python code in the text field</p>
            <div>
                <h1><b>Knight Attack</b></h1>
                <p> A knight and a pawn are on a chess board. Can you figure out the minimum number of
                    moves required for the knight to travel to the same position of the pawn? On a single
                    move, the knight can move in an "L" shape; two spaces in any direction, then one space
                    in a perpendicular direction. This means that on a single move, a knight has eight
                    possible positions it can move to. 
                </p>
                <p>
                    Write a function, knight_attack, that takes in 5 arguments:
                </p>
                <p>
                    n, kr, kc, pr, pc
                </p>
                <p>
                    n =the length of the chess board
                </p>
                <p>
                    kr = the starting row of the knight
                </p>
                <p>
                    kc = the starting column of the knight
                </p>
                <p>
                    pr = the row of the pawn
                </p>
                <p>
                    pc = the column of the pawn
                </p>
                <p>The function should return a number representing the minimum number of moves
                    required for the knight to land on top of the pawn. The knight cannot move out of
                    bounds of the board. You can assume that rows and columns are 0-indexed. This
                    means that if n = 8, there are 8 rows and 8 columns numbered 0 to 7. If it is not possible
                    for the knight to attack the pawn, then return None.</p>
            </div>
            <div style={{marginTop: '20px'}}>
                <img src={chess} alt="Chessboard" style={{ maxWidth: '25%', height: 'auto'}} />
            </div>
            <div>
                <label style={{marginRight: '10px'}}>Upload the solution file:</label>
                <input type="file" onChange={fileUpload}/>
            </div>
            {file && (
                <div>
                    <p>Uploaded File: {file.name}</p>
                    <p>File Size: {file.size} bytes</p>
                </div>
            )}
            <div style={{marginBottom: '10px'}}>
                <label>Enter Code:</label>
                <textarea rows={20} style={{width: '100%'}} placeholder="Enter solution code" value={input} onChange={inputChange}/>
            </div>
            <div style={{textAlign: 'right'}}>
                <button style={{padding: '5px 10px', fontSize: '26px', fontWeight: 'bold'}} onClick={submit}>Submit</button>
            </div>
        </div>
    );
};

export default Home;
