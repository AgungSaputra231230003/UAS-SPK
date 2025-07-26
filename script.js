document.addEventListener('DOMContentLoaded', function () {
  // Elemen DOM
  const criteriaContainer = document.getElementById('criteria-container');
  const alternativesContainer = document.getElementById('alternatives-container');
  const addcriteriaBtn = document.getElementById('add-criteria');
  const addAlternativeBtn = document.getElementById('add-alternative');
  const calculateBtn = document.getElementById('calculate-btn');
  const resultsSection = document.getElementById('results');
  const normalizationMatrix = document.getElementById('normalization-matrix');
  const weightedMatrix = document.getElementById('weighted-matrix');
  const finalResults = document.getElementById('final-results');
  const bestAlternativeEl = document.getElementById('best-alternative');
  const bestScoreEl = document.getElementById('best-score');
  const recommendationEl = document.getElementById('recommendation');

  // Fasilitas yang tersedia
  const facilityOptions = [
    { id: 'taman', label: 'Taman Belakang', value: 1 },
    { id: 'wc', label: 'WC dalam Kamar', value: 2 },
    { id: 'garasi', label: 'Garasi Mobil', value: 3 },
    { id: 'kolam', label: 'Kolam Renang', value: 4 },
    { id: 'gym', label: 'Gym', value: 5 },
    { id: 'dapur', label: 'Dapur Modern', value: 6 },
  ];

  // Event Listeners
  addcriteriaBtn.addEventListener('click', addcriteria);
  addAlternativeBtn.addEventListener('click', addAlternative);
  calculateBtn.addEventListener('click', calculateSAW);

  // Inisialisasi
  init();

  function init() {
    // untuk menghapus kriteria dan alternatif
    document.querySelectorAll('.remove-criteria').forEach((button) => {
      button.addEventListener('click', function () {
        this.closest('.criteria').remove();
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
  function addcriteria() {
    const criteriaDiv = document.createElement('div');
    criteriaDiv.className = 'criteria';
    criteriaDiv.innerHTML = `
                    <input type="text" placeholder="Nama Kriteria" class="nama-criteria">
                    <select class="criteria-type">
                        <option value="benefit">Benefit</option>
                        <option value="cost" selected>Cost</option>
                    </select>
                    <input type="number" placeholder="Bobot (1-100)" class="criteria-weight" min="1" max="100" value="10">
                    <input type="text" placeholder="Satuan" class="criteria-unit">
                    <button class="remove-criteria"><i class="fas fa-trash"></i> Hapus</button>
                `;
    criteriaContainer.appendChild(criteriaDiv);

    criteriaDiv.querySelector('.remove-criteria').addEventListener('click', function () {
      criteriaContainer.removeChild(criteriaDiv);
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

    const criteriaDivs = criteriaContainer.querySelectorAll('.criteria');
    criteriaDivs.forEach((criteria, index) => {
      const NamaCriteria = criteria.querySelector('.nama-criteria').value;
      const unit = criteria.querySelector('.criteria-unit').value || '';

      // Jika kriteria adalah Fasilitas, buat checkbox
      if (NamaCriteria.toLowerCase() === 'fasilitas') {
        const facilityContainer = document.createElement('div');
        facilityContainer.className = 'facility-container';

        const label = document.createElement('p');
        label.style.marginBottom = '10px';
        label.textContent = 'Fasilitas:';
        facilityContainer.appendChild(label);

        const facilitiesDiv = document.createElement('div');
        facilitiesDiv.className = 'facilities-container';

        facilityOptions.forEach((facility, i) => {
          const facilityOption = document.createElement('div');
          facilityOption.className = 'facility-option';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = `facility-new-${i}`;
          checkbox.className = 'facility-checkbox';

          const label = document.createElement('label');
          label.htmlFor = `facility-new-${i}`;
          label.textContent = facility.label;

          facilityOption.appendChild(checkbox);
          facilityOption.appendChild(label);
          facilitiesDiv.appendChild(facilityOption);
        });

        facilityContainer.appendChild(facilitiesDiv);
        valuesDiv.appendChild(facilityContainer);
      } else {
        // Untuk kriteria lainnya, buat input number biasa
        const valueInput = document.createElement('input');
        valueInput.type = 'number';

        // Tentukan placeholder berdasarkan nama kriteria dan satuan
        if (unit) {
          valueInput.placeholder = `${NamaCriteria} (${unit})`;
        } else {
          valueInput.placeholder = NamaCriteria;
        }

        valueInput.className = 'alternative-value';
        valueInput.dataset.CriteriaIndex = index;
        valuesDiv.appendChild(valueInput);
      }
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
    const criteriaDivs = criteriaContainer.querySelectorAll('.criteria');

    alternativeDivs.forEach((alternativeDiv) => {
      const valuesDiv = alternativeDiv.querySelector('.alternative-values');
      const currentValues = [];

      // Simpan nilai yang sudah ada
      const existingInputs = valuesDiv.querySelectorAll('.alternative-value, .facility-container');
      existingInputs.forEach((input) => {
        if (input.classList.contains('facility-container')) {
          const checkboxes = input.querySelectorAll('.facility-checkbox');
          const checkedValues = Array.from(checkboxes).map((cb) => cb.checked);
          currentValues.push({
            type: 'facility',
            values: checkedValues,
          });
        } else {
          currentValues.push({
            type: 'value',
            value: input.value,
            placeholder: input.placeholder,
          });
        }
      });

      valuesDiv.innerHTML = '';

      criteriaDivs.forEach((criteria, index) => {
        const NamaCriteria = criteria.querySelector('.nama-criteria').value;
        const unit = criteria.querySelector('.criteria-unit').value || '';

        // Jika kriteria adalah Fasilitas, buat checkbox
        if (NamaCriteria.toLowerCase() === 'fasilitas') {
          const facilityContainer = document.createElement('div');
          facilityContainer.className = 'facility-container';

          const label = document.createElement('p');
          label.style.marginBottom = '10px';
          label.textContent = 'Fasilitas:';
          facilityContainer.appendChild(label);

          const facilitiesDiv = document.createElement('div');
          facilitiesDiv.className = 'facilities-container';

          facilityOptions.forEach((facility, i) => {
            const facilityOption = document.createElement('div');
            facilityOption.className = 'facility-option';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `facility-${alternativeDivs.length}-${i}`;
            checkbox.className = 'facility-checkbox';

            // Set nilai checkbox jika ada data sebelumnya
            if (currentValues[index]?.type === 'facility' && currentValues[index].values[i]) {
              checkbox.checked = true;
            }

            const label = document.createElement('label');
            label.htmlFor = `facility-${alternativeDivs.length}-${i}`;
            label.textContent = facility.label;

            facilityOption.appendChild(checkbox);
            facilityOption.appendChild(label);
            facilitiesDiv.appendChild(facilityOption);
          });

          facilityContainer.appendChild(facilitiesDiv);
          valuesDiv.appendChild(facilityContainer);
        } else {
          // Untuk kriteria lainnya, buat input number biasa
          const valueInput = document.createElement('input');
          valueInput.type = 'number';

          // Tentukan placeholder berdasarkan nama kriteria dan satuan
          if (unit) {
            valueInput.placeholder = `${NamaCriteria} (${unit})`;
          } else {
            valueInput.placeholder = NamaCriteria;
          }

          valueInput.className = 'alternative-value';
          valueInput.dataset.CriteriaIndex = index;

          // Pertahankan nilai yang sudah ada jika masih sesuai
          if (currentValues[index]?.type === 'value') {
            valueInput.value = currentValues[index].value;
          }

          valuesDiv.appendChild(valueInput);
        }
      });
    });
  }

  // Fungsi utama SAW
  function calculateSAW() {
    // Ambil data kriteria dari form
    const criteria = [];
    const criteriaDivs = criteriaContainer.querySelectorAll('.criteria');

    criteriaDivs.forEach((criteriaDiv, index) => {
      const name = criteriaDiv.querySelector('.nama-criteria').value || `Kriteria ${index + 1}`;
      const type = criteriaDiv.querySelector('.criteria-type').value;
      const weight = parseFloat(criteriaDiv.querySelector('.criteria-weight').value) || 1;
      const unit = criteriaDiv.querySelector('.criteria-unit').value || '';

      criteria.push({
        name,
        type,
        weight,
        unit,
        normalizedWeight: 0,
      });
    });

    // Normalisasi bobot
    const totalWeight = criteria.reduce((sum, criteria) => sum + criteria.weight, 0);
    criteria.forEach((criteria) => {
      criteria.normalizedWeight = criteria.weight / totalWeight;
    });

    // Ambil data alternatif dari form
    const alternatives = [];
    const alternativeDivs = alternativesContainer.querySelectorAll('.alternative');

    alternativeDivs.forEach((alternativeDiv, altIndex) => {
      const name = alternativeDiv.querySelector('.alternative-name').value || `Alternatif ${altIndex + 1}`;
      const values = [];

      const criteriaDivs = criteriaContainer.querySelectorAll('.criteria');
      criteriaDivs.forEach((criteriaDiv, critIndex) => {
        const NamaCriteria = criteriaDiv.querySelector('.nama-criteria').value;

        // Jika kriteria adalah Fasilitas, hitung jumlah fasilitas yang dipilih
        if (NamaCriteria.toLowerCase() === 'fasilitas') {
          const facilityContainer = alternativeDiv.querySelector('.facility-container');
          const checkboxes = facilityContainer.querySelectorAll('.facility-checkbox');
          const checkedCount = Array.from(checkboxes).filter((cb) => cb.checked).length;
          values.push(checkedCount);
        } else {
          // Untuk kriteria lainnya, ambil nilai dari input number
          const valueInputs = alternativeDiv.querySelectorAll('.alternative-value');
          let value = parseFloat(valueInputs[critIndex]?.value) || 0;

          // Konversi ke satuan yang sesuai jika kriteria adalah harga
          if (criteria[critIndex]?.unit === 'juta') {
            value = value * 1000000; // Konversi juta ke rupiah
          }

          values.push(value);
        }
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

    criteria.forEach((criteria, critIndex) => {
      const values = alternatives.map((alt) => alt.values[critIndex]);
      maxValues.push(Math.max(...values));
      minValues.push(Math.min(...values));
    });

    alternatives.forEach((alternative) => {
      alternative.normalizedValues = [];

      criteria.forEach((criteria, critIndex) => {
        const value = alternative.values[critIndex];
        let normalizedValue;

        if (criteria.type === 'benefit') {
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

      criteria.forEach((criteria, critIndex) => {
        const weightedValue = alternative.normalizedValues[critIndex] * criteria.normalizedWeight;
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
                    ${createMatrixTable(normalizedMatrix.alternatives, criteria, 'normalizedValues', 'Perumahan')}
                `;

    weightedMatrix.innerHTML = `
                    <h4><i class="fas fa-calculator"></i> Matriks Terbobot</h4>
                    ${createMatrixTable(weightedMatrix.alternatives, criteria, 'weightedValues', 'Perumahan')}
                `;

    finalResults.innerHTML = `
                    <h4><i class="fas fa-trophy"></i> Hasil Akhir Ranking</h4>
                    ${createResultsTable(alternatives)}
                `;
  }

  // Buat tabel matriks
  function createMatrixTable(items, criteriaArray, valueType, rowHeader) {
    if (criteriaArray.length === 0 || items.length === 0) return '<p>Tidak ada data</p>';

    let html = '<table><tr><th>' + rowHeader + '</th>';

    criteriaArray.forEach((criteria) => {
      let displayName = criteria.name;

      // Tambahkan satuan untuk kriteria tertentu
      if (criteria.unit) {
        displayName += ` (${criteria.unit})`;
      }

      html += `<th>${displayName}<br>(${criteria.type === 'benefit' ? 'Benefit' : 'Cost'})</th>`;
    });

    html += '</tr>';

    items.forEach((item) => {
      html += `<tr><td>${item.name}</td>`;

      item[valueType].forEach((value, index) => {
        const criteria = criteriaArray[index];
        let displayValue;

        // Format khusus untuk nilai persentase
        if (criteria.unit === '%') {
          displayValue = (value * 100).toFixed(2) + '%';
        } else {
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
