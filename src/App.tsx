import { useState } from 'react'
import './App.css'
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';


function App() {
  const fees = {
    12: [3729.19, 4116.71, 4690.66, 5194.62, 5845.54, 6020.90],
    13: [4137.72, 4592.67, 4837.64, 5313.60, 5971.53, 6150.68],
  }

  const format = (value: number) => {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).concat(' €');
  }

  enum CalculationTyp {
    Monthly,
    Yearly,
    YearlyWithBonus
  }

  const january24 = 1;
  const november24 = 11;
  const january25 = 13;
  const february25 = 14;

  const calculateFee = (fee: number, month: number, type: CalculationTyp): number => {
    let value = fee;

    if(month >= january24 ) {
      value += 100;
    }

    if(month >= november24 ) {
      value += 200;
    }

    if(month >= january25 ) {
      value += 10;
    }

    if(month >= february25 ) {
      value += (fee * 0.055);
    }

    if(type === CalculationTyp.Yearly || type === CalculationTyp.YearlyWithBonus) {
      value = value * 12;
    }

    if(type === CalculationTyp.YearlyWithBonus) {
        value = value + (0.65 * fee);
    }

    return value;
  };

  const calculateFeeString = (fee: number, month: number, type: CalculationTyp): string => {
    return format(calculateFee(fee, month, type));
  };

  const calculateMonths = (fee: number, ): number[] => {
    const months = [];

    for(let i = 0; i < 15; i++) {
      const result = calculateFee(fee, i, CalculationTyp.Monthly);

      months.push(result);
    }

    return months;
  };

  const addInflationCompensation = (fees: number[]): number[] => {
    const newFees = fees.map((fee, index) => {
      if(index > 0 &&  index < 11) {
        fee += 120;
      }

      return fee;
    });

    return newFees;
  }

  const [selectedFee, selectFee] = useState(0)
  const months = calculateMonths(selectedFee);
  const monthsWithInflationCompensation = addInflationCompensation(months);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Gehaltsentwicklung 2023-2025',
      },
    },
  };
  
  const labels = [ 'Dezember 23', 'Januar 24', 'Februar 24', 'März 24', 'April 24', 'Mai 24', 'Juni 24', 'Juli 24', 'August 24', 'September 24', 'Oktober 24', 'November 24', 'Dezember 24', 'Januar 25', 'Februar 25'];
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Bruttoentgelt im Monat inkl. Dataportzulage',
        data: months,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Bruttoentgelt im Monat inkl. Dataportzulage und Inflationsausgleich',
        data: monthsWithInflationCompensation,
        borderColor: 'rgb(173, 216, 230)',
        backgroundColor: 'rgba(173, 216, 230, 0.5)',
      },
    ],
  };

  return (
    <>
      <h1>Entwicklung der Dataport Gehälter nach dem Tarifabschluss</h1>
    
        <h2>Entgeltgruppe auswählen</h2>
        <table>
          <thead>
            <tr>
              <th>Entgeltgruppe</th>
              <th>Stufe 1</th>
              <th>Stufe 2</th>
              <th>Stufe 3</th>
              <th>Stufe 4</th>
              <th>Stufe 5</th>
              <th>Stufe 6</th>
            </tr>
          </thead>
         
          <tbody>
            <tr>
              <td><b>13</b></td>
            {fees['13'].map((value) => (
              <td onClick={() => selectFee(value)} key={value}>{format(value)}</td>
              ))}
            </tr>

            <tr>
              <td><b>12</b></td>
            {fees['12'].map((value) => (
              <td onClick={() => selectFee(value)} key={value}>{format(value)}</td>
              ))}
            </tr>
          </tbody>
         
        </table>

      
        {selectedFee !== 0 ? (
          <>
            <h2>Bruttoentgelte</h2>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Januar 24</th>
                  <th>November 24</th>
                  <th>Februar 25</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Brutto im Monat</td>
                  <td>{calculateFeeString(selectedFee, january24, CalculationTyp.Monthly)}</td>
                  <td>{calculateFeeString(selectedFee, november24, CalculationTyp.Monthly)}</td>
                  <td>{calculateFeeString(selectedFee, february25, CalculationTyp.Monthly)}</td>
                </tr>
                <tr>
                  <td>Brutto im Jahr</td>
                  <td>{calculateFeeString(selectedFee, january24, CalculationTyp.Yearly)}</td>
                  <td>{calculateFeeString(selectedFee, november24, CalculationTyp.Yearly)}</td>
                  <td>{calculateFeeString(selectedFee, february25, CalculationTyp.Yearly)}</td>
                </tr>

                <tr>
                  <td>Brutto im Jahr mit Jahressonderzahlung</td>
                  <td>{calculateFeeString(selectedFee, january24, CalculationTyp.YearlyWithBonus)}</td>
                  <td>{calculateFeeString(selectedFee, november24, CalculationTyp.YearlyWithBonus)}</td>
                  <td>{calculateFeeString(selectedFee, february25, CalculationTyp.YearlyWithBonus)}</td>
                </tr>
              </tbody>
            </table>

            <Line options={options} data={data} />
          </>
        )
      : null}

    </>
  )
}

export default App
