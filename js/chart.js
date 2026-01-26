import "../main.js";
import Chart from 'chart.js/auto';

const ctx = document.getElementById('graph-container');

//Funcion de asistencia

(async function(){

    new Chart(
        document.getElementById('graph_diagram'),
        {
            type:'line',
            data:{
                labels: arrayMoney.map(row => row.mano),
                datasets:[
                    {
                        label: 'ye mone',
                        data: arrayMoney.map(row => row.dinero)
                    }
                ]
            }
        }
    )
})();