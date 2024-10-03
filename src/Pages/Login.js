import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient'
import * as reactSpring from '@react-spring/three'
import * as drei from '@react-three/drei'
import * as fiber from '@react-three/fiber'


const Login = () => {
  const [apiKey, setApiKey] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('keyValue', apiKey);
      
      const response = await axios.post('http://127.0.0.1:5000/api-key-submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResponseMessage(response.data);
      navigate('/dashboard');
    } catch (error) {
      console.error('There was an error submitting the API key!', error);
      setResponseMessage('Error submitting API key');
    }
  };

  return (
    
    <div className="App" id="gradient">
        {/* <div className="z-index-[-1000]">
            <ShaderGradientCanvas 
                className="absolute z-index-[-1000]"
                // importedFiber={{ ...fiber, ...drei, ...reactSpring }}
                style={{    
                    position: 'absolute',
                    pointerEvents: "none" ,
                    top: 0
                }}
            >
                <ShaderGradient
                    className="z-index-[-1000]"
                    control='query'
                    urlString='https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.2&cAzimuthAngle=180&cDistance=2.9&cPolarAngle=120&cameraZoom=1&color1=%23ffcea3&color2=%23b8c4f8&color3=%2382b0ff&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=40&frameRate=10&gizmoHelper=hide&grain=off&lightType=3d&pixelDensity=1&positionX=0&positionY=1&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=-90&shader=defaults&type=plane&uDensity=1&uFrequency=5.5&uSpeed=0.1&uStrength=3&uTime=0.2&wireframe=false&zoomOut=false'
                    cDistance={32}
                    cPolarAngle={125}
                    enableTransition={false}
                />
            </ShaderGradientCanvas>
        </div> */}
        
        <div className="flex items-center justify-center min-h-screen z-index-[1000]">
            <div className=" p-8 w-[830px] h-[530px] md:max-w-[70em] mx-[auto] my-[128px] font-[inter] rounded-[19px] z-index-[1000] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] bg-white text-[16px]">
                <div className="mx-[17px]">
                    <br></br>
                    <h1 className="text-[35px] font-[adamina]">Omni Login</h1>
                    <br></br>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <label className="px-[6px] text-[18px] font-[500]">
                            Email
                            <br></br>
                    
                            <input className="mt-[2px] border-2 w-[500px] h-[50px] rounded-[10px] p-[12px] font-[400] text-[16px]"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            </label>
                            <br></br>
                            <br></br>
                            <label className="px-[6px] text-[18px] font-[500]">
                            Password
                            <br></br>
                            <input className="mt-[2px] border-2 w-[500px] h-[50px] rounded-[10px] p-[12px] font-[400] text-[16px]"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            
                            </label >
                            <br></br>
                            <br></br>
                            <label className="px-[6px] text-[18px] font-[500]">
                            GitHub Personal Access Token
                            <br></br>
                            <input
                                className="mt-[2px] border-2 w-[500px] h-[50px] rounded-[10px] p-[12px] font-[400] text-[16px]"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                required
                            />
                            </label>
                            <br></br>
                            <br></br>
                            <button className="bg-[#96B3F8] hover:bg-[#98A6E0] text-white font-bold py-2 px-4 w-[140px] h-[50px] rounded-[25px]" type="submit">Submit</button>
                        </form>
                        {responseMessage && <p>{responseMessage}</p>}
                    </div>
                    
                </div>
                
        </div>
      </div>
    </div>
  );
};
  


export default Login;
  
  