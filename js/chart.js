import "../main.js";
import Chart from 'chart.js/auto';

const ctx = document.getElementById('graph-container');

//Funcion de asistencia

(async function(){
    const testData = arrayMoney;

    new Chart(
        document.getElementById('graph_diagram'),
        {
            type:'line',
            data:{
                labels: testData.map(row => row.mano),
                datasets:[
                    {
                        label: 'ye mone',
                        data: testData.map(row => row.dinero)
                    }
                ]
            }
        }
    )
})();