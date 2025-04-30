// Speech synthesis: https://github.com/mdn/dom-examples/blob/main/web-speech-api/speak-easy-synthesis/
document.addEventListener("DOMContentLoaded", () => {
  const synth = window.speechSynthesis;
  const button = document.getElementById('button');
  const outPreview = document.getElementById('preview');

  let voices = [];

  let speech = "Así se va a escuchar la voz.";

  const voiceSelect = document.querySelector("#voice");
  const langSelect = document.querySelector("#lang");

  function populateVoiceList() {
    voices = synth.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase();
      const bname = b.name.toUpperCase();

      if (aname < bname) {
        return -1;
      } else if (aname == bname) {
        return 0;
      } else {
        return +1;
      }
    });

    voices = voices.filter((a) => {
      return a.lang.includes(langSelect.value);
    })

    const selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
    voiceSelect.innerHTML = "";

    for (let i = 0; i < voices.length; i++) {
      const option = document.createElement("option");
      option.textContent = `${voices[i].name} (${voices[i].lang})`;

      if (voices[i].default) {
        option.textContent += " -- DEFAULT";
      }

      option.setAttribute("data-lang", voices[i].lang);
      option.setAttribute("data-name", voices[i].name);
      voiceSelect.appendChild(option);
    }
    voiceSelect.selectedIndex = selectedIndex;
  }

  populateVoiceList();

  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
    langSelect.onchange = populateVoiceList;
  }

  function speak() {
    if (synth.speaking) {
      console.error("speechSynthesis.speaking");
      return;
    }

    if (speech !== "") {
      const utterThis = new SpeechSynthesisUtterance(speech);

      utterThis.onend = function (event) {
        console.log("SpeechSynthesisUtterance.onend");
      };

      utterThis.onerror = function (event) {
        console.error("SpeechSynthesisUtterance.onerror");
      };

      const selectedOption =
        voiceSelect.selectedOptions[0].getAttribute("data-name");

      for (let i = 0; i < voices.length; i++) {
        if (voices[i].name === selectedOption) {
          utterThis.voice = voices[i];
          break;
        }
      }

      synth.speak(utterThis);
    }
  }

  button.addEventListener("click", firstClick);

  async function firstClick() {
    let port = await navigator.serial.requestPort()

    await port.open({ baudRate: 115200 });

    const encoder = new TextEncoder();

    const reader = port.readable.getReader();
    const writer = port.writable.getWriter();

    button.innerHTML = "Edit Values (Beta)"
    button.removeEventListener("click", firstClick);
    button.addEventListener("click", ()=> {
      window.location.href = "./Editor";
    })

    // Listen to data coming from the serial device.
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        // Allow the serial port to be closed later.
        reader.releaseLock();
        break;
      }
      
      try {
        document.getElementById("disconnected").id = "connected"
        document.querySelector("a").innerText = "Connected"
        let list = getCookie("values")
        writer.write(encoder.encode(list))
      } catch {}
      // value is a Uint8Array.
      // console.log(value);
      last = value;
      let msg = "";

      if (value[0] === 58) {
        for(let i = 1; i < value.length; i++){
          msg += String.fromCharCode(value[i])
        }
        speech = msg;
        // console.log(msg);
        speak();
      } else if(value[0] == 33) {
        for(let i = 1; i < value.length; i++){
          msg += String.fromCharCode(value[i])
        }
        outPreview.innerHTML = msg;
      }
    }
  }


  voiceSelect.onchange = function () {
    speak();
  };
})

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}  