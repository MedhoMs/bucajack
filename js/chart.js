
import Chart from 'chart.js/auto';

const ctx = document.getElementById('graph-container');

//Funcion de asistencia

(async function(){

    moneyData = [];
    moneyData = window.moneyArray;

    new Chart(
        document.getElementById('graph_diagram'),
        {
            type:'line',
            data:{
                labels: moneyData.map(row => row.mano),
                datasets:[
                    {
                        label: 'ye mone',
                        data: moneyData.map(row => row.dinero)
                    }
                ]
            }
        }
    )
})();