import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import AWS from 'aws-sdk';

const ResultList = ({signOut, user}) => {
    const [results, setResults] = useState([]);
    const [score, setScore] = useState(null);
    const [highestScore, setHighestScore] = useState(null);
    const navigate = useNavigate();


    useEffect(() =>{
        AWS.config.update({
            accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
            secretAccessKey: process.env.REACT_APP_SECRET_KEY,
            region: 'us-west-1'
        });

        const dynamodb = new AWS.DynamoDB.DocumentClient();
        const params = {
            TableName: 'finaldata',
        };
    
        dynamodb.scan(params, (err, data) => {
            if (err) {
            console.error('Error fetching titles:', err);
            } else {
            console.log('Details fetched successfully:', data.Items);
            data.Items.forEach(item => {
                console.log('User: ', item.user);
            });
            }
        });
    }, [user]);

    const runTest = async () => {
        try{
            const response = await fetch('http://localhost:5000/runTest');
            if(!response.ok){
                throw new Error('Network response is not working');
            }
            const data = await response.json();
            setResults(data.test_results);
            setScore(data.score);
            updateScoreInDB(user.signInDetails.loginId, data.score);

            await new Promise(resolve => setTimeout(resolve, 100));
            const high = await getHighScore(user.signInDetails.loginId);
            setHighestScore(high);
            
        } catch (error){
            console.error('Error fetching test results:', error);
        }

    };

    const updateScoreInDB = async(userE, score) => {
        try{
            const dynamodb = new AWS.DynamoDB.DocumentClient();

            const params ={
                TableName: 'finaldata',
                Key:{
                    email: userE,
                },
            };

            const existUser = await dynamodb.get(params).promise();

            if(existUser.Item){
                const currentScore = existUser.Item.score;

                if(score > currentScore){
                    const updateParam = {
                        TableName: 'finaldata',
                        Key:{
                            email: userE,
                        },
                        UpdateExpression: 'SET score = :score',
                        ExpressionAttributeValues:{
                            ':score': score,
                        },
                    };

                    await dynamodb.update(updateParam).promise();
                    console.log('updated score');
                } 
                else{
                    console.log('score not higher');
                }
            }
            else{
                const insertNew = {
                    TableName: 'finaldata',
                    Item:{
                        email: userE,
                        score: score,
                    },
                };
                
                await dynamodb.put(insertNew).promise();
                console.log('New user added with score');
            }
        } catch (error){
            console.error('Error when fetching score', error);
        }
    }

    const getHighScore = async (email) => {
        try{
            const dynamodb = new AWS.DynamoDB.DocumentClient();

            const params={
                TableName: 'finaldata',
                KeyConditionExpression: 'email = :email',
                ExpressionAttributeValues: {
                    ':email': email,
                },
                ScanIndexForward: false,
                Limit: 1,
            };

            const result = await dynamodb.query(params).promise();
            return result.Items.length > 0 ? result.Items[0].score : null;
        } catch (error){
            console.error('Issue fetching high score', error);
            return null;
        }

    };

    const back = () => {
        navigate('/');
    }

    return(
        <div>
            <button onClick={back} style={{marginTop: '20px'}}>Go Back</button>
            <h2 style={{marginLeft: '20px'}}>Results Page</h2>
            <h3 style={{marginLeft: '20px'}}>Welcome, {user.signInDetails.loginId}: <button onClick={signOut}>Logout</button></h3>
            <button onClick={runTest} style={{marginLeft: '20px'}}>Release Grade</button>
            <h3 style={{marginLeft: '20px'}}>Test cases results: </h3>
            <div style={{marginLeft: '20px'}}>
                {results.length > 0 ? (
                    <ul>
                    {results.map((result, index) =>(
                        <li key={index}>
                            {result.test_name} - {result.status} ({result.execution_time_ms} ms)
                        </li>
                    ))}
                    </ul>
                ):(
                    <p>No results available. Click "Run Tests" to fetch result.</p>
                )}
                {score !== null && (
                    <h3> Score: {score}%</h3>
                )}
                <h3>Past Highest Score: {highestScore !== null ? `${highestScore}%` : 'N/A'}</h3>
            </div>
        </div>
    );
};

export default ResultList;