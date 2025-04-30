document.addEventListener("DOMContentLoaded", ()=>{
    const table = document.getElementById("table");
    const save = document.getElementById("save");

    if(getCookie("values") == '') {
        console.log("Added cookie")
        setCookie("values", "a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z| ", 99999999);
    }

    let vals = []

    vals = getCookie("values").split("|")

    console.log(vals)

    for(let i = 0; i < 32; i++) {
        const tr = document.createElement("tr");
        const td_num = document.createElement("td");
        const td_val = document.createElement("td");
        const input = document.createElement("input");
        input.className = "inp"
        if(vals.length > i) input.value = vals[i]
        td_val.appendChild(input);
        let num = ""
        for(let ii = 0; ii<5-dec2bin(i).length;ii++) {
            num+="0"
        }
        num+=dec2bin(i);
        td_num.innerHTML = num
        tr.appendChild(td_num);
        tr.appendChild(td_val);
        table.appendChild(tr);
    }

    save.addEventListener("click", ()=>{
        console.log("saving")
        // Convert values to string
        let vals = "";
        let inps = document.getElementsByClassName("inp")
        
        for(let i = 0; i < 32; i++) {
            vals += inps[i].value;
            vals += "|"
        }

        console.log(vals)

        setCookie("values", vals, 99999999)
    })
})

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
  
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