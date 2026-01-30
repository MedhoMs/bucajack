
import Chart from 'chart.js/auto';
import { moneyArray} from "./main.js";

const ctx = document.getElementById('graph-container');

//Funcion de asistencia

(async function(){

    new Chart(
        document.getElementById('graph_diagram'),
        {
            type:'line',
            data:{
                labels: moneyArray.map(row => row.mano),
                datasets:[
                    {
                        label: 'ye mone',
                        data: moneyArray.map(row => row.dinero)
                    }
                ]
            }
        }
    )
})();