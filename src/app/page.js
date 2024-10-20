'use client';
import { useState, useEffect } from "react";
import ReactDOMServer from "react-dom/server";
import Navbar from "@/Components/Navbar";
import SendIcon from '@mui/icons-material/Send';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonIcon from '@mui/icons-material/Person';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";
import "./globals.css";
import Shockwave from "@/assets/Shockwave.jpeg";

const Page = () => {
  const [UserInput, SetUserInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // State to hold the selected image
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Function to handle image selection
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
      console.log(selectedImage)
    }
  };

  // Function to process prompts with or without images
  const propmtresult = async (prompt) => {
    try {
      const loadingSpan = document.getElementById("loading-span");
      SetUserInput(""); // Clear input field after user message is sent

      let result;
      if (selectedImage) {
        const imageData = await convertImageToBase64(selectedImage);
        const image = {
          inlineData: {
            data: imageData,
            mimeType: selectedImage.type,
          },
        };
        result = await model.generateContent([prompt, image]); // Send both prompt and image
      } else {
        result = await model.generateContent(prompt); // Only send prompt
      }

      const response = await result.response;
      const text = await response.text();
      console.log(text);
      loadingSpan.remove(); // Remove loading span after response
      InsertAiMessage(text); // Call function to insert AI message
    } catch (error) {
      console.error(error);
    }
  };

  // Function to convert the image file to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve(reader.result.split(",")[1]); // Return base64 string without prefix
      reader.onerror = (error) => reject(error);
    });
  };

  const InsertAiMessage = (Result) => {
    const chatContainer = document.querySelector(".allchat");
    const h2 = document.createElement('h2');
    h2.className = "text-[2rem] font-semibold flex gap-[0.5rem] items-baseline";

    const autoAwesomeIconString = ReactDOMServer.renderToString(<AutoAwesomeIcon className="text-purple-400 !text-[2rem] cursor-pointer" />);
    const autoAwesomeIcon = document.createElement('span');
    autoAwesomeIcon.innerHTML = autoAwesomeIconString;
    h2.appendChild(autoAwesomeIcon);

    const pre = document.createElement('pre');
    pre.className = "font-normal whitespace-pre-wrap break-all";

    let i = 0;
    const typingAnimation = () => {
      if (i < Result.length) {
        pre.innerHTML += Result.charAt(i);
        i++;
        setTimeout(typingAnimation, 50);
      }
    };

    h2.appendChild(pre);
    chatContainer.appendChild(h2);
    typingAnimation();
  };

  const InsertUserMessage = () => {
    if (UserInput.trim() === "") {
      alert("Please enter the prompt");
    } else {
      const chatContainer = document.querySelector(".allchat");

      const h2 = document.createElement('h2');
      const span = document.createElement('span');
      span.id = "loading-span";
      span.className = "!w-[5rem] text-blue-400 loading loading-dots loading-lg";
      h2.className = "text-[2rem] font-semibold text-gray-400 flex gap-[0.5rem] items-baseline";

      const personIconString = ReactDOMServer.renderToString(<PersonIcon className="!text-[2rem] cursor-pointer" />);
      const personIcon = document.createElement('span');
      personIcon.innerHTML = personIconString;

      h2.appendChild(personIcon);
      h2.appendChild(document.createTextNode(UserInput));
      chatContainer.appendChild(h2);
      chatContainer.appendChild(span);

      // Call AI API to get response
      propmtresult(UserInput);
      scrollToBottom();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      InsertUserMessage();
    }
  };

  function scrollToBottom() {
    const messageArea = document.querySelector(".allchat");
    messageArea.scrollTop = messageArea.scrollHeight;
  }

  return (
    <div>
      <Navbar />
      <div className="flex justify-center items-center pt-[2rem] flex-col gap-[2rem]">
        <div className="below-sm:w-[95%] min-h-[75vh] bg-gray-900 w-[70%] rounded-[1rem] p-[1rem] overflow-hidden">
          <div className="allchat h-[75vh] flex flex-col gap-[0.8rem] overflow-y-auto">
            <h2 className=" text-[2rem] flex gap-[0.5rem] items-center">
              <AutoAwesomeIcon className="text-purple-400 !text-[2rem] cursor-pointer" />
              Hello, how can I help you?
            </h2>
          </div>
        </div>
        <div className="below-sm:w-[95%] w-[70%] flex justify-center items-end gap-[1rem]">
          <input
            value={UserInput}
            onChange={(e) => SetUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-[80%] text-gray-200 bg-transparent border-b-[2px] focus:outline-none text-[1.5rem]"
            type="text"
            placeholder="Enter the prompt"
          />
          <SendIcon 
            onClick={InsertUserMessage} 
            className="!text-[2.5rem] rotate-[330deg] cursor-pointer" 
          />
           <input
            type="file"
            accept="image/*"
            onChange={handleImageChange} // Handle image upload
            className=" "
            id="imageInput"
          />
        </div>
      </div>
      <Image src={Shockwave} alt="Shockwave" className="absolute top-0 h-[100vh] z-[-5] opacity-[80%]" />
    </div>
  );
};

export default Page;
