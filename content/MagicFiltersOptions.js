

function onDialogLoad() {
	var cbInverseOrder = document.getElementById("cb_inverseOrder");
	var rgParseMode = document.getElementById("rg_parseMode");
	var tbSubstitute = document.getElementById("tb_substitute");

    rgParseMode.onclick = function() {
        if (rgParseMode.value == "replace") {
            cbInverseOrder.disabled = true;
            tbSubstitute.disabled = false;
        }
        if (rgParseMode.value == "subfolders") {
            cbInverseOrder.disabled = false;
            tbSubstitute.disabled = true;
        }
    };

    tbSubstitute.onchange = function(element) {
        if (tbSubstitute.value.includes("." ) ) {
            alert("If you use a dot in this String this addon might not work as expected");
        }
    }
}

function onDialogAccept(){
    return true;
}
