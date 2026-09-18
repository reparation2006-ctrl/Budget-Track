const ctx = document.getElementById('expenseChart');

new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Logement', 'Alimentation', 'Transport', 'Loisirs', 'Santé'],
    datasets: [{
      data: [42, 28, 15, 10, 5],
      backgroundColor: ['#0b4fd6', '#3b8ddb', '#03a2b5', '#8ec2f5', '#c3dbfb'],
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item) => `${item.label} : ${item.parsed}%`
        }
      }
    }
  }
});
