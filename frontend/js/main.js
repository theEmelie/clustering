var numOfIterations = -1;

document.getElementById("goButton").addEventListener("click", function (e) {
    e.preventDefault();
    var iterations = document.getElementById("iterations").value;
    var url = 'http://localhost:3000/kClustering?iterations=' + iterations;
    //console.log(iterations);
    if ((iterations == -1 || iterations > 0) && iterations != "") {
        fetch(url, {
            method: 'get',
        })
        .then(response => response.json())
        .then(data => (displayClusters(data)));
    }
});

function displayClusters(data) {
    //console.log(data);
    var clusterDiv = document.getElementById("clusterDiv");
    clusterDiv.innerHTML = "";

    for (var i = 0; i < data.length; i++) {
        var clusterButton = document.createElement("button");
        clusterButton.innerHTML = "Cluster " + (i+1) + " (" + data[i].length + ")";
        clusterButton.classList.add("clusterSection");
        
        clusterButton.addEventListener("click", function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });

        var panelDiv = document.createElement("div");
        panelDiv.classList.add("panel");

        var unorderedList = document.createElement("ul");
        for (var j = 0; j < data[i].length; j++ ) {
            var listItem = document.createElement("li");
            listItem.innerHTML = data[i][j];
            unorderedList.appendChild(listItem);
        }
        panelDiv.appendChild(unorderedList);
        clusterDiv.appendChild(clusterButton);
        clusterDiv.appendChild(panelDiv);
    }
}
