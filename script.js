let serviceUuid = '0196e5a4-fd2a-721b-89e2-c1b35c90038b';
let stringCharUuid = '0196e5a5-1a12-740e-adbf-85e61aea0be4';
let triggerCharUuid = '0196e5a5-51ec-7220-ab24-d619ab2e460d';
let receiveCharUuid = "0196e67e-7c18-7499-8e81-a8ff2644e8fb";
let device, server, service, receiveChar;

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
    try {
        device = await navigator.bluetooth.requestDevice({
          filters: [{ services: [serviceUuid] }]
        });
        server = await device.gatt.connect();
        service = await server.getPrimaryService(serviceUuid);

        document.getElementById("disconnected").id = "connected"
        document.querySelector("a").innerText = "Connected"

        // Subscribe to trigger notifications
        const triggerChar = await service.getCharacteristic(triggerCharUuid);
        await triggerChar.startNotifications();
        triggerChar.addEventListener('characteristicvaluechanged', (event) => {
          speak();
          const triggerValue = new Uint8Array(event.target.value.buffer)[0];
          document.getElementById('triggerValue').innerText = `Trigger Value: ${triggerValue}`;
        });

        const decoder = new TextDecoder('utf-8');

        const stringChar = await service.getCharacteristic(stringCharUuid);
        await stringChar.startNotifications();
        stringChar.addEventListener('characteristicvaluechanged', (event) => {
          document.getElementById('preview').innerText = decoder.decode(stringChar.value);
          speech = decoder.decode(stringChar.value);
        })

        receiveChar = await service.getCharacteristic(receiveCharUuid);
      } catch (error) {
        console.error('Error connecting to BLE device', error);
      }

    button.innerHTML = "Edit Values"
    button.removeEventListener("click", firstClick);
    button.addEventListener("click", ()=> {
      window.open("./Editor")
    })

    // Listen to data coming from the serial device.
    // while (true) {
      try {
        let list = getCookie("values")
        sendList(list);
      } catch {}
    // }
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

async function sendList(data) {
  if (receiveChar) {
    const data = document.getElementById('dataInput').value;
    const encoder = new TextEncoder();
    await receiveChar.writeValue(encoder.encode(data));
    console.log(`Data sent: ${data}`);
  } else {
    console.error('Not connected to ESP32 or characteristic not available');
  }
}