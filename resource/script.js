document.addEventListener('DOMContentLoaded', function () {
  // Elemen DOM
  const criteriaContainer = document.getElementById('criteria-container');
  const alternativesContainer = document.getElementById('alternatives-container');
  const addCriterionBtn = document.getElementById('add-criterion');
  const addAlternativeBtn = document.getElementById('add-alternative');
  const calculateBtn = document.getElementById('calculate-btn');
  const resultsSection = document.getElementById('results');
  const normalizationMatrix = document.getElementById('normalization-matrix');
  const weightedMatrix = document.getElementById('weighted-matrix');
  const finalResults = document.getElementById('final-results');
  const bestAlternativeEl = document.getElementById('best-alternative');
  const bestScoreEl = document.getElementById('best-score');
  const recommendationEl = document.getElementById('recommendation');

  // Event Listeners
  addCriterionBtn.addEventListener('click', addCriterion);
  addAlternativeBtn.addEventListener('click', addAlternative);
  calculateBtn.addEventListener('click', calculateSAW);

  // Inisialisasi
  init();

  function init() {
    // Tambahkan event listeners untuk menghapus kriteria dan alternatif
    document.querySelectorAll('.remove-criterion').forEach((button) => {
      button.addEventListener('click', function () {
        this.closest('.criterion').remove();
        updateAlternativeValueInputs();
      });
    });

    document.querySelectorAll('.remove-alternative').forEach((button) => {
      button.addEventListener('click', function () {
        this.closest('.alternative').remove();
      });
    });

    // Update placeholder untuk input nilai
    updateAlternativeValueInputs();
  }

  // Fungsi tambah kriteria
  function addCriterion() {
    const criterionDiv = document.createElement('div');
    criterionDiv.className = 'criterion';
    criterionDiv.innerHTML = `
                    <input type="text" placeholder="Nama Kriteria" class="criterion-name">
                    <select class="criterion-type">
                        <option value="benefit">Benefit</option>
                        <option value="cost" selected>Cost</option>
                    </select>
                    <input type="number" placeholder="Bobot (1-100)" class="criterion-weight" min="1" max="100" value="10">
                    <input type="text" placeholder="Satuan" class="criterion-unit">
                    <button class="remove-criterion"><i class="fas fa-trash"></i> Hapus</button>
                `;
    criteriaContainer.appendChild(criterionDiv);

    criterionDiv.querySelector('.remove-criterion').addEventListener('click', function () {
      criteriaContainer.removeChild(criterionDiv);
      updateAlternativeValueInputs();
    });

    updateAlternativeValueInputs();
  }

  // Fungsi tambah alternatif
  function addAlternative() {
    const alternativeDiv = document.createElement('div');
    alternativeDiv.className = 'alternative';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Nama Perumahan';
    nameInput.className = 'alternative-name';

    const valuesDiv = document.createElement('div');
    valuesDiv.className = 'alternative-values';

    const criterionDivs = criteriaContainer.querySelectorAll('.criterion');
    criterionDivs.forEach((criterion, index) => {
      const criterionName = criterion.querySelector('.criterion-name').value;
      const unit = criterion.querySelector('.criterion-unit').value || '';

      const valueInput = document.createElement('input');
      valueInput.type = 'number';

      // Tentukan placeholder berdasarkan nama kriteria dan satuan
      if (unit) {
        valueInput.placeholder = `${criterionName} (${unit})`;
      } else {
        valueInput.placeholder = criterionName;
      }

      valueInput.className = 'alternative-value';
      valueInput.dataset.criterionIndex = index;
      valuesDiv.appendChild(valueInput);
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-alternative';
    removeBtn.innerHTML = '<i class="fas fa-trash"></i> Hapus';

    alternativeDiv.appendChild(nameInput);
    alternativeDiv.appendChild(valuesDiv);
    alternativeDiv.appendChild(removeBtn);

    alternativesContainer.appendChild(alternativeDiv);

    removeBtn.addEventListener('click', function () {
      alternativesContainer.removeChild(alternativeDiv);
    });
  }

  // Update input nilai alternatif
  function updateAlternativeValueInputs() {
    const alternativeDivs = alternativesContainer.querySelectorAll('.alternative');
    const criterionDivs = criteriaContainer.querySelectorAll('.criterion');

    alternativeDivs.forEach((alternativeDiv) => {
      const valuesDiv = alternativeDiv.querySelector('.alternative-values');
      const currentValues = [];

      // Simpan nilai yang sudah ada
      const existingInputs = valuesDiv.querySelectorAll('.alternative-value');
      existingInputs.forEach((input) => {
        currentValues.push({
          value: input.value,
          placeholder: input.placeholder,
        });
      });

      valuesDiv.innerHTML = '';

      criterionDivs.forEach((criterion, index) => {
        const criterionName = criterion.querySelector('.criterion-name').value;
        const unit = criterion.querySelector('.criterion-unit').value || '';

        const valueInput = document.createElement('input');
        valueInput.type = 'number';

        // Tentukan placeholder berdasarkan nama kriteria dan satuan
        if (unit) {
          valueInput.placeholder = `${criterionName} (${unit})`;
        } else {
          valueInput.placeholder = criterionName;
        }

        valueInput.className = 'alternative-value';
        valueInput.dataset.criterionIndex = index;

        // Pertahankan nilai yang sudah ada jika masih sesuai
        if (currentValues[index] !== undefined) {
          valueInput.value = currentValues[index].value;
        }

        valuesDiv.appendChild(valueInput);
      });
    });
  }

  // Fungsi utama SAW
  function calculateSAW() {
    // Ambil data kriteria dari form
    const criteria = [];
    const criterionDivs = criteriaContainer.querySelectorAll('.criterion');

    criterionDivs.forEach((criterionDiv, index) => {
      const name = criterionDiv.querySelector('.criterion-name').value || `Kriteria ${index + 1}`;
      const type = criterionDiv.querySelector('.criterion-type').value;
      const weight = parseFloat(criterionDiv.querySelector('.criterion-weight').value) || 1;
      const unit = criterionDiv.querySelector('.criterion-unit').value || '';

      criteria.push({
        name,
        type,
        weight,
        unit,
        normalizedWeight: 0,
      });
    });

    // Normalisasi bobot
    const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    criteria.forEach((criterion) => {
      criterion.normalizedWeight = criterion.weight / totalWeight;
    });

    // Ambil data alternatif dari form
    const alternatives = [];
    const alternativeDivs = alternativesContainer.querySelectorAll('.alternative');

    alternativeDivs.forEach((alternativeDiv, altIndex) => {
      const name =
        alternativeDiv.querySelector('.alternative-name').value || `Alternatif ${altIndex + 1}`;
      const values = [];

      const valueInputs = alternativeDiv.querySelectorAll('.alternative-value');
      valueInputs.forEach((input, critIndex) => {
        let value = parseFloat(input.value) || 0;

        // Konversi ke satuan yang sesuai jika kriteria adalah harga
        if (criteria[critIndex]?.unit === 'juta') {
          value = value * 1000000; // Konversi juta ke rupiah
        }

        values.push(value);
      });

      alternatives.push({
        name,
        values,
        normalizedValues: [],
        weightedValues: [],
        finalScore: 0,
        rank: 0,
      });
    });

    // 1. Normalisasi matriks
    const normalizedMatrix = normalizeMatrix(alternatives, criteria);

    // 2. Hitung matriks terbobot
    const weightedMatrix = calculateWeightedMatrix(normalizedMatrix, criteria);

    // 3. Hitung skor akhir
    calculateFinalScores(alternatives, criteria);

    // 4. Ranking
    rankAlternatives(alternatives);

    // Tampilkan hasil
    displayResults(normalizedMatrix, weightedMatrix, alternatives, criteria);
    resultsSection.style.display = 'block';

    // Tampilkan rekomendasi terbaik
    if (alternatives.length > 0) {
      bestAlternativeEl.textContent = alternatives[0].name;
      bestScoreEl.textContent = alternatives[0].finalScore.toFixed(4);
      recommendationEl.style.display = 'block';
    }
  }

  // Normalisasi matriks
  function normalizeMatrix(alternatives, criteria) {
    const maxValues = [];
    const minValues = [];

    criteria.forEach((criterion, critIndex) => {
      const values = alternatives.map((alt) => alt.values[critIndex]);
      maxValues.push(Math.max(...values));
      minValues.push(Math.min(...values));
    });

    alternatives.forEach((alternative) => {
      alternative.normalizedValues = [];

      criteria.forEach((criterion, critIndex) => {
        const value = alternative.values[critIndex];
        let normalizedValue;

        if (criterion.type === 'benefit') {
          normalizedValue = value / maxValues[critIndex];
        } else {
          normalizedValue = minValues[critIndex] / value;
        }

        if (isNaN(normalizedValue)) normalizedValue = 0;
        if (!isFinite(normalizedValue)) normalizedValue = 0;

        alternative.normalizedValues.push(normalizedValue);
      });
    });

    return { alternatives, maxValues, minValues };
  }

  // Matriks terbobot
  function calculateWeightedMatrix(normalizedMatrix, criteria) {
    normalizedMatrix.alternatives.forEach((alternative) => {
      alternative.weightedValues = [];

      criteria.forEach((criterion, critIndex) => {
        const weightedValue = alternative.normalizedValues[critIndex] * criterion.normalizedWeight;
        alternative.weightedValues.push(weightedValue);
      });
    });

    return normalizedMatrix;
  }

  // Skor akhir
  function calculateFinalScores(alternatives, criteria) {
    alternatives.forEach((alternative) => {
      alternative.finalScore = alternative.weightedValues.reduce((sum, value) => sum + value, 0);
    });
  }

  // Ranking
  function rankAlternatives(alternatives) {
    alternatives.sort((a, b) => b.finalScore - a.finalScore);
    alternatives.forEach((alternative, index) => {
      alternative.rank = index + 1;
    });
  }

  // Tampilkan hasil
  function displayResults(normalizedMatrix, weightedMatrix, alternatives, criteria) {
    normalizationMatrix.innerHTML = `
                    <h4><i class="fas fa-table"></i> Matriks Normalisasi</h4>
                    ${createMatrixTable(
                      normalizedMatrix.alternatives,
                      criteria,
                      'normalizedValues',
                      'Perumahan'
                    )}
                `;

    weightedMatrix.innerHTML = `
                    <h4><i class="fas fa-calculator"></i> Matriks Terbobot</h4>
                    ${createMatrixTable(
                      weightedMatrix.alternatives,
                      criteria,
                      'weightedValues',
                      'Perumahan'
                    )}
                `;

    finalResults.innerHTML = `
                    <h4><i class="fas fa-trophy"></i> Hasil Akhir Ranking</h4>
                    ${createResultsTable(alternatives)}
                `;
  }

  // Buat tabel matriks (DENGAN PERBAIKAN UNTUK PERSENTASE)
  function createMatrixTable(items, criteriaArray, valueType, rowHeader) {
    if (criteriaArray.length === 0 || items.length === 0) return '<p>Tidak ada data</p>';

    let html = '<table><tr><th>' + rowHeader + '</th>';

    criteriaArray.forEach((criterion) => {
      let displayName = criterion.name;

      // Tambahkan satuan untuk kriteria tertentu
      if (criterion.unit) {
        displayName += ` (${criterion.unit})`;
      }

      html += `<th>${displayName}<br>(${criterion.type === 'benefit' ? 'Benefit' : 'Cost'})</th>`;
    });

    html += '</tr>';

    items.forEach((item) => {
      html += `<tr><td>${item.name}</td>`;

      item[valueType].forEach((value, index) => {
        const criterion = criteriaArray[index];
        let displayValue;

        // PERBAIKAN: Format khusus untuk nilai persentase
        if (criterion.unit === '%') {
          // Untuk persentase, gunakan 2 digit di belakang koma
          displayValue = (value * 100).toFixed(2) + '%';
        } else {
          // Untuk nilai lainnya, gunakan 4 digit di belakang koma
          displayValue = value.toFixed(4);
        }

        html += `<td>${displayValue}</td>`;
      });

      html += '</tr>';
    });

    html += '</table>';
    return html;
  }

  // Buat tabel hasil
  function createResultsTable(alternatives) {
    if (alternatives.length === 0) return '<p>Tidak ada data</p>';

    let html = `
                    <table>
                        <tr>
                            <th>Peringkat</th>
                            <th>Perumahan</th>
                            <th>Skor Akhir</th>
                        </tr>
                `;

    alternatives.forEach((alternative, index) => {
      const rowClass = index === 0 ? 'rank-1' : '';
      html += `
                        <tr class="${rowClass}">
                            <td>${alternative.rank}</td>
                            <td>${alternative.name}</td>
                            <td class="final-score">${alternative.finalScore.toFixed(4)}</td>
                        </tr>
                    `;
    });

    html += '</table>';
    return html;
  }
});