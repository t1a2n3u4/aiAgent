let prompt = document.querySelector("#prompt");
let chatcontainer = document.querySelector(".chat-container");
let submitBtn = document.querySelector("#submit");
let imagebtn=document.querySelector("#image");
let image=document.querySelector("#image img")

let imageinput=document.querySelector("#imageinput")
const api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCK1bvRfLPzRT5sIq8nwOR-EL6NkXKg2Ok";

let user = {
  message: null,
  file: {
    mim_type:null,
    data:null
  }
};

async function generateResponse(aichatbox) {

  let parts = [{ text: user.message }];

  if (user.file.data) {
    parts.push({
      inline_data: {
        mime_type: user.file.mim_type,
        data: user.file.data
      }
    });
  }

  let requestOption = {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: parts
        }
      ]
    })
  };
  try {
    let response = await fetch(api_url, requestOption);
    let data = await response.json();

    let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();

    // AI chat box ke andar response daalna
    let aiTextDiv = aichatbox.querySelector(".ai-chat");
    aiTextDiv.innerHTML = apiResponse;

  } catch (error) {
    console.log(error);
  } finally {
    //to scroll
    chatcontainer.scrollTo({ top: chatcontainer.scrollHeight, behavior: "smooth" });

    let image = aichatbox.querySelector("#loading"); // agar koi image change karni ho
    if (image) {
      image.src = `loading.webp`;
      image.classList.remove("choose");
      user.file={}
    }

    user.file = {};
  }
}

function createchatbox(html, classes) {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}

function handlechatResponse(usermessage) {
  if (usermessage.trim() === "") return;

  user.message = usermessage;

  let html = `<img src="u2.jpg" alt="" id="userimage" width="10%">
<div class="user_chat">
${user.message}
${user.file.data?`<img src="data:${user.file.mime_type};base64,${user.file.data}"
 class="chooseimg"/>`:" "}
</div>`;
  prompt.value = "";

  let userchatbox = createchatbox(html, "user-chatbox");
  chatcontainer.appendChild(userchatbox);
chatcontainer.scrollTo({top:chatcontainer.scrollHeight,behavior:"smooth"})
  setTimeout(() => {
    let html = `<img src="ai.png" alt="" id="aiimage" width="70">
      <div class="ai-chat">
        <img src="loading.webp" alt="loading" id="loading" width="70">
      </div>`;
    let aichatbox = createchatbox(html, "ai-chatbox");
    chatcontainer.appendChild(aichatbox);

    generateResponse(aichatbox);
  }, 3000);
}

prompt.addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    e.preventDefault();
    handlechatResponse(prompt.value);
  }
})
imageinput.addEventListener("change",()=>{
  const file= imageinput.files[0]
  if(!file) return
  let reader=new FileReader();
  reader.onload=(e)=>{
    let base64string=e.target.result.split(",")[1]
    user.file= {
    mim_type:file.type,
    data: base64string
  };
  image.src=`data:${user.file.mim_type};base64,${user.file.data}`
image.classList.add("choose")
}

  reader.readAsDataURL(file)

})
imagebtn.addEventListener("click", () => {
 imagebtn.querySelector("input").click();
});

submitBtn.addEventListener("click", () => {
  handlechatResponse(prompt.value);
});
