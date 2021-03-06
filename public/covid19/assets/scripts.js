(async function() {
    const token =localStorage.getItem("token")
    if (token == null) {
        return
    } else {
        dibujarGrafico();
        dibujarTabla();
    
        $("#inicio").removeClass("d-block").addClass("d-none");
        $("#resultado").removeClass("d-none").addClass("d-block");
    }
})();

$("#logout").on("click", function(){
    localStorage.clear();
    location.reload();
})

$("#init").on("click", function(){
    location.reload();
})

$("#formulario").on("submit", async function(ev){

    ev.preventDefault();
    
    const email = $("#email").val()
    const password = $("#password").val()

    const getToken = await fetch("/api/login", {
        method: 'POST',
        body: JSON.stringify({email, password })
    })

    const jwt = await getToken.json()

    localStorage.setItem("token", jwt.token)
    const token = localStorage.getItem("token")

    if (token == jwt.token) {
        
        dibujarGrafico();
        dibujarTabla();
    
        $("#inicio").removeClass("d-block").addClass("d-none");
        $("#resultado").removeClass("d-none").addClass("d-block");
    } else {
        alert("Correo y/o contraseña incorrecta!")
        localStorage.clear()
        location.reload()
        return;
    }

});

async function getData () {
    const data = await fetch('/api/total')
    const data2 = await data.json()
    const paises = data2.data
    return paises

}

async function dibujarGrafico () {
    const datos = await getData();
    const paisesGrafico = datos.filter( pais => pais.deaths >= 100000);
    console.log(paisesGrafico)

    const confirmados = [] //dataPoints
    const muertos = [] //dataPoints

    for (pais of paisesGrafico) {
        confirmados.push(
            { label: pais.location, y: pais.confirmed }
        ) 
        muertos.push(
            { label: pais.location, y: pais.deaths }
        ) 
    }
    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        title:{
            text: "Casos Confirmados y Muertos de COVID"
        },	
        axisY: {
            title: "Casos COVID confirmados",
            titleFontColor: "#4F81BC",
            lineColor: "#4F81BC",
            labelFontColor: "#4F81BC",
            tickColor: "#4F81BC"
        },
        axisY2: {
            title: "Muertos COVID",
            titleFontColor: "#C0504E",
            lineColor: "#C0504E",
            labelFontColor: "#C0504E",
            tickColor: "#C0504E"
        },	
        toolTip: {
            shared: true
        },
        legend: {
            cursor:"pointer",
            itemclick: toggleDataSeries
        },
        data: [{
            type: "column",
            name: "Casos COVID confirmados",
            legendText: "Casos COVID confirmados",
            showInLegend: true, 
            dataPoints: confirmados,
        },
        {
            type: "column",	
            name: "Número de muertos por COVID",
            legendText: "Número de muertos por COVID",
            axisYType: "secondary",
            showInLegend: true,
            dataPoints: muertos,
        }]
    });
    chart.render();
    
    function toggleDataSeries(e) {
        if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        }
        else {
            e.dataSeries.visible = true;
        }
        chart.render();
    }
    
}

async function dibujarTabla () {
    const paises = await getData();
    console.log(paises)
    let i = 1
    for (pais of paises) {
        $("#cuerpotabla").append(`
            <tr>
                <td>${i}</td>
                <td>${pais.location}</td>
                <td>${pais.confirmed}</td>
                <td>${pais.deaths}</td>
                <td><button type="button" data-pais="${pais.location}" "data-bs-toggle="modal" class="btndatos btn btn-link">Ver detalle</button></td>
            </tr>
        `)
        i++
    }
    $(".btndatos").on("click", mostrarModal)

}

async function mostrarModal() {
    let idPais = $(this).attr("data-pais")
    let data = await fetch(`/api/countries/${idPais}`)
    let data2 = await data.json();
    let pais = data2.data
    let numConfirmados = parseInt(pais.confirmed);
    let numMuertos = parseInt(pais.deaths);

    var chart2 = new CanvasJS.Chart("chartModal", {
        animationEnabled: true,
        title:{
            text: `Casos Confirmados y Muertos de COVID`
        },	
        axisY: {
            title: "Casos COVID confirmados",
            titleFontColor: "#4F81BC",
            lineColor: "#4F81BC",
            labelFontColor: "#4F81BC",
            tickColor: "#4F81BC"
        },
        axisY2: {
            title: "Muertos COVID",
            titleFontColor: "#C0504E",
            lineColor: "#C0504E",
            labelFontColor: "#C0504E",
            tickColor: "#C0504E"
        },	
        toolTip: {
            shared: true
        },
        legend: {
            cursor:"pointer",
            itemclick: toggleDataSeries
        },
        data: [{
            type: "column",
            name: "Casos COVID confirmados",
            legendText: "Casos COVID confirmados",
            showInLegend: true, 
            dataPoints: [
                { label: `hola`, y:numConfirmados },
            ]
        },
        {
            type: "column",	
            name: "Número de muertos por COVID",
            legendText: "Número de muertos por COVID",
            axisYType: "secondary",
            showInLegend: true,
            dataPoints: [
                { label: `${pais.location}`, y:numMuertos },
            ]
        }]
    });
    chart2.render();
    
    function toggleDataSeries(e) {
        if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        }
        else {
            e.dataSeries.visible = true;
        }
        chart.render();
    }

    $('#exampleModalLabel').html(`${pais.location}`);
    $('#modalito').modal('show'); 

}


