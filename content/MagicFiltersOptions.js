

function onDialogLoad() {
	var cbInverseOrder = document.getElementById("cb_inverseOrder");
	var rgParseMode = document.getElementById("rg_parseMode");
    rgParseMode.onclick = function() {
        if (rgParseMode.value == "replace") {
            cbInverseOrder.disabled = true;
        }
        if (rgParseMode.value == "subfolders") {
            cbInverseOrder.disabled = false;
        }
    };
}

function onDialogAccept(){
    return true;
}
