// src/App.jsx
import React, { useState, useEffect } from 'react';

//
// 1) Landing Page — unchanged
//
function Landing({ onBank, onDealer }) {
  return (
    <div style={styles.landingWrapper}>
      <img src="/bni-logo.png" alt="BNI Logo" style={styles.logoLarge} />
      <h1 style={styles.title}>Selamat Datang di Platform Lelang Surat Berharga BNI</h1>
      <p style={styles.subtitle}>
        Menyederhanakan proses input kuotasi lelang surat berharga untuk semua mitra perbankan.
      </p>
      <div style={styles.buttonGroup}>
        <button style={styles.primaryButton} onClick={onBank}>
          Masuk Sebagai Bank Lain
        </button>
        <button style={styles.primaryButton} onClick={onDealer}>
          Masuk Sebagai Dealer BNI
        </button>
      </div>
      <footer style={styles.footer}>© {new Date().getFullYear()} BNI</footer>
    </div>
  );
}

//
// 2) LoginBank — unchanged
//
function LoginBank({ onSubmit, onBack }) {
  const banks = [
    'BONA','BOA JKT','BOA SG','DH','BPM','FUJI',
    'DPLK BNI','HI BANK','RITEL','BPD BALI',
    'Bank Mega','RIYADH','TASPEN'
  ];
  const [bank, setBank] = useState(banks[0]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = e => {
    e.preventDefault();
    if (username === 'dummy' && password === 'dummy') onSubmit(bank);
    else setError('Username atau password salah');
  };

  return (
    <div style={styles.loginWrapper}>
      <button onClick={onBack} style={styles.backButton}>&larr; Kembali</button>
      <h2 style={styles.pageTitle}>Login Bank Lain</h2>
      <form style={styles.form} onSubmit={handleLogin}>
        <label style={styles.label}>
          Pilih Bank:
          <select value={bank} onChange={e => setBank(e.target.value)} style={styles.input}>
            {banks.map(b => <option key={b}>{b}</option>)}
          </select>
        </label>
        <label style={styles.label}>
          Username:
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={styles.input}/>
        </label>
        <label style={styles.label}>
          Password:
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input}/>
        </label>
        {error && <p style={styles.errorText}>{error}</p>}
        <button type="submit" style={styles.primaryButton}>Login</button>
      </form>
    </div>
  );
}

//
// 2b) LoginDealer — unchanged
//
function LoginDealer({ onSubmit, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = e => {
    e.preventDefault();
    if (username === 'dummy' && password === 'dummy') onSubmit();
    else setError('Username atau password salah');
  };

  return (
    <div style={styles.loginWrapper}>
      <button onClick={onBack} style={styles.backButton}>&larr; Kembali</button>
      <h2 style={styles.pageTitle}>Login Dealer BNI</h2>
      <form style={styles.form} onSubmit={handleLogin}>
        <label style={styles.label}>
          Username:
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={styles.input}/>
        </label>
        <label style={styles.label}>
          Password:
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input}/>
        </label>
        {error && <p style={styles.errorText}>{error}</p>}
        <button type="submit" style={styles.primaryButton}>Login</button>
      </form>
    </div>
  );
}

//
// 2c) ChooseTypePage — unchanged
//
function ChooseTypePage({ onSelect, onBack }) {
  return (
    <div style={styles.loginWrapper}>
      <button onClick={onBack} style={styles.backButton}>&larr; Kembali</button>
      <h2 style={styles.pageTitle}>Pilih Jenis Lelang</h2>
      <div style={styles.buttonGroup}>
        <button style={styles.primaryButton} onClick={() => onSelect('SRBI')}>SRBI</button>
        <button style={styles.primaryButton} onClick={() => onSelect('SUN')}>SUN</button>
        <button style={styles.primaryButton} onClick={() => onSelect('SBSN')}>SBSN</button>
      </div>
    </div>
  );
}

//
// 3) BankPage — only change is hiding "Finalisasi Kuotasi" after announcementConfirmed
//
function BankPage({ bankName, submissions, addSubmission, onBackToLogin, onLogout, lelangType }) {
  const visible = submissions.filter(s => s.bank === bankName && s.type === lelangType);

  // <-- BARU: cek sudah ada announcementConfirmed?
  const anyAnnouncement = visible.some(s => s.announcementConfirmed);

  const seriesMap = {
    SRBI: ['12 Bulan','9 Bulan','6 Bulan'],
    SUN:  ['SPN03250723','SPN12260423','FR0104','FR0103','FR0106','FR0107','SPN0102','SPN0105'],
    SBSN: ['SPNS13102025','SPNS12012026','PBS003','PBS030','PBS034','PBS039','PBS038']
  };
  const seriesOptions = seriesMap[lelangType] || [];
  const [series, setSeries]         = useState(seriesOptions[0] || '');
  const [yieldValue, setYield]      = useState('');
  const [amount, setAmount]         = useState('');
  const [confirming, setConfirming] = useState(false);
  const [finalized, setFinalized]   = useState(false);
  const [countdown, setCountdown]   = useState('');
  const [pendingNotif, setPendingNotif] = useState([]);
  const [wonNotif, setWonNotif]     = useState(null);

  // countdown timer
  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date();
      let t = new Date(now);
      t.setHours(10, 30, 0, 0);
      if (now > t) t.setDate(t.getDate() + 1);
      const diff = t - now;
      const h = Math.floor(diff / 1000 / 3600);
      const m = Math.floor(diff / 1000 / 60) % 60;
      const s = Math.floor(diff / 1000) % 60;
      setCountdown(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // dealer confirms
  useEffect(() => {
    const newly = visible.filter(s => s.confirmed && !s._notified);
    if (newly.length) {
      setPendingNotif(q => [...q, ...newly.map(s => s.series)]);
      newly.forEach(s => s._notified = true);
    }
  }, [visible]);

  // announcement pop-up
  useEffect(() => {
    const won = visible.find(s => s._wonNotif);
    if (won) {
      setWonNotif({ series: won.series, amount: won._won });
      won._wonNotif = false;
    }
  }, [submissions]);

  // computeNominal
  const toNum = v => {
    if (v == null) return NaN;
    if (typeof v === 'number') return v;
    return parseFloat(String(v).replace(',', '.'));
  };
  const computeNominal = s => {
    const F = toNum(s.amount),
          G = toNum(s.yieldValue),
          H = toNum(s.highestYield),
          I = toNum(s.proporsiHighest),
          J = toNum(s.proporsiNC),
          isNC = String(s.yieldValue).trim().toLowerCase() === 'nc';
    if (isNC)      return !isNaN(J) ? +(F * J / 100).toFixed(2) : 'cek lagi';
    if (isNaN(F)||isNaN(G)||isNaN(H)) return 'cek lagi';
    if (G < H)     return +F.toFixed(2);
    if (G > H)     return 0;
    return !isNaN(I) ? +(F * I / 100).toFixed(2) : 'cek lagi';
  };

  const handleSubmit = e => {
    e.preventDefault();
    addSubmission({
      bank: bankName,
      type: lelangType,
      series,
      yieldValue: yieldValue.trim(),
      amount,
      confirmed: false,
      announcementConfirmed: false
    });
    setYield('');
    setAmount('');
  };

  const handleDelete = i => {
    const rem = visible[i], idx = submissions.indexOf(rem);
    if (idx >= 0) submissions.splice(idx, 1);
    addSubmission({}); // rerender
  };

  const finalize = () => {
    setConfirming(false);
    setFinalized(true);
  };
  const dismissNotif = () => setPendingNotif(q => q.slice(1));
  const dismissWon   = () => setWonNotif(null);

  return (
    <div style={styles.bankWrapper}>
      {finalized && (
        <button onClick={onLogout} style={styles.logoutButton}>Logout</button>
      )}
      <button onClick={onBackToLogin} style={styles.backButton} disabled={finalized}>
        &larr; Kembali
      </button>

      <div style={styles.bankRow}>
        {/* form input */}
        <div style={styles.inputCol}>
          <h2 style={styles.pageTitle}>Bank: {bankName} — {lelangType}</h2>
          <form style={styles.form} onSubmit={handleSubmit}>
            <label style={styles.label}>
              Seri:
              <select
                value={series}
                onChange={e => setSeries(e.target.value)}
                style={styles.input}
                disabled={finalized}
              >
                {seriesOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label style={styles.label}>
              Yield (% atau NC):
              <input
                type="text"
                placeholder="7.04 atau NC"
                value={yieldValue}
                onChange={e => setYield(e.target.value)}
                style={styles.input}
                disabled={finalized}
              />
            </label>
            <label style={styles.label}>
              Jumlah (Rp M):
              <input
                type="number"
                placeholder="50"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={styles.input}
                disabled={finalized}
              />
            </label>
            <button
              type="submit"
              style={{ ...styles.primaryButton, opacity: finalized ? 0.5 : 1 }}
              disabled={finalized}
            >
              Kirim Kuotasi
            </button>
          </form>
        </div>

        {/* rekap kuotasi */}
        <div style={styles.tableCol}>
          <p style={styles.countdown}>Waktu Sisa Input: {countdown}</p>
          <h3 style={styles.pageTitle}>Rekap Kuotasi</h3>
          {visible.length === 0 ? (
            <p style={{ ...styles.subtitle, color: '#374151' }}>Belum ada kuotasi.</p>
          ) : (
            <>
              <table style={styles.tableWide}>
                <thead>
                  <tr>
                    {[
                      'Bank','Seri','Yield','Jumlah',
                      'Yield Tertinggi','Porsi Highest (%)',
                      'Proporsi NC (%)','Nominal Dimenangkan (M)','Aksi'
                    ].map((h,i) => (
                      <th key={i} style={styles.colCenter}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((s, i) => (
                    <tr key={i} style={i % 2 ? styles.rowOdd : styles.rowEven}>
                      <td style={styles.colCenter}>{s.bank}</td>
                      <td style={styles.colCenter}>{s.series}</td>
                      <td style={styles.colCenter}>{s.yieldValue}</td>
                      <td style={styles.colCenter}>{s.amount}</td>
                      <td style={styles.colCenter}>{s.highestYield || '-'}</td>
                      <td style={styles.colCenter}>{s.proporsiHighest || '-'}</td>
                      <td style={styles.colCenter}>{s.proporsiNC || '-'}</td>
                      <td style={styles.colCenter}>{computeNominal(s)}</td>
                      <td style={styles.colCenter}>
                        <button
                          onClick={() => handleDelete(i)}
                          style={styles.deleteButton}
                          disabled={s.announcementConfirmed}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* HANYA tampilkan jika belum finalized & belum ada announcement */}
              {!finalized && !anyAnnouncement && (
                <button style={styles.finalButton} onClick={() => setConfirming(true)}>
                  Finalisasi Kuotasi
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {confirming && (
        <div style={styles.overlay}>
          <div style={styles.confirmDialog}>
            <p>Apakah anda yakin semua kuotasi telah di input?</p>
            <div style={styles.confirmButtons}>
              <button onClick={() => setConfirming(false)} style={styles.secondaryButton}>Kembali</button>
              <button onClick={finalize} style={styles.primaryButton}>Ya</button>
            </div>
          </div>
        </div>
      )}

      {pendingNotif.length > 0 && (
        <div style={styles.overlay}>
          <div style={styles.confirmDialog}>
            <p>Dealer telah mengkonfirmasi seri {pendingNotif[0]}.</p>
            <div style={styles.confirmButtons}>
              <button onClick={dismissNotif} style={styles.primaryButton}>Ya</button>
            </div>
          </div>
        </div>
      )}

      {wonNotif && (
        <div style={styles.overlay}>
          <div style={styles.confirmDialog}>
            <p>Seri {wonNotif.series} — Nominal Dimenangkan: {wonNotif.amount} M</p>
            <div style={styles.confirmButtons}>
              <button onClick={dismissWon} style={styles.primaryButton}>Ya</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//
// 3b) DealerPage — unchanged
//
function DealerPage({ submissions, setSubs, onBackToLogin, onLogout, onAnnouncement, lelangType }) {
  const visible = submissions.filter(s => s.type === lelangType);
  const [confirmRow, setConfirmRow] = useState(null);

  const handleConfirmClick = i => setConfirmRow(i);
  const handleConfirmYes   = () => {
    setSubs(subs => subs.map((s, idx) =>
      idx === confirmRow
        ? { ...s, confirmed: true }
        : s
    ));
    setConfirmRow(null);
  };

  return (
    <div style={styles.bankWrapper}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onLogout} style={styles.logoutButton}>Logout</button>
      </div>
      <button onClick={onBackToLogin} style={styles.backButton}>&larr; Kembali</button>
      <button
        onClick={onAnnouncement}
        style={{ ...styles.primaryButton, marginLeft: 16, marginBottom: 24 }}
      >
        Pengumuman Lelang
      </button>
      <h3 style={styles.pageTitle}>Rekap Kuotasi — {lelangType}</h3>
      {visible.length === 0 ? (
        <p style={{ ...styles.subtitle, color: '#374151' }}>Belum ada kuotasi.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.col, textAlign: 'left' }}>Bank</th>
              <th style={{ ...styles.col, textAlign: 'left' }}>Seri</th>
              <th style={{ ...styles.col, textAlign: 'right' }}>Yield (%)</th>
              <th style={{ ...styles.col, textAlign: 'right' }}>Jumlah</th>
              <th style={{ ...styles.col, textAlign: 'center' }}>Konfirmasi</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s, i) => (
              <tr key={i} style={i % 2 ? styles.rowOdd : styles.rowEven}>
                <td style={{ ...styles.col, textAlign: 'left' }}>{s.bank}</td>
                <td style={{ ...styles.col, textAlign: 'left' }}>{s.series}</td>
                <td style={{ ...styles.col, textAlign: 'right' }}>{s.yieldValue}</td>
                <td style={{ ...styles.col, textAlign: 'right' }}>{s.amount}</td>
                <td style={{ ...styles.col, textAlign: 'center' }}>
                  <button
                    onClick={() => handleConfirmClick(i)}
                    disabled={s.confirmed}
                    style={{
                      ...styles.primaryButton,
                      backgroundColor: s.confirmed
                        ? styles.secondaryButton.backgroundColor
                        : styles.primaryButton.backgroundColor,
                      cursor: s.confirmed ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Konfirmasi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {confirmRow !== null && (
        <div style={styles.overlay}>
          <div style={styles.confirmDialog}>
            <p>Apakah anda yakin seri “{visible[confirmRow].series}” telah diinput?</p>
            <div style={styles.confirmButtons}>
              <button onClick={() => setConfirmRow(null)} style={styles.secondaryButton}>Kembali</button>
              <button onClick={handleConfirmYes} style={styles.primaryButton}>Ya</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//
// 3c) AnnouncementPage — unchanged
//
function AnnouncementPage({ submissions, setSubs, onBack, onInputSource, onLogout, lelangType }) {
  const confirmed = submissions.filter(s => s.confirmed && s.type === lelangType);

  const toNum = v => {
    if (v == null) return NaN;
    if (typeof v === 'number') return v;
    return parseFloat(String(v).replace(',', '.'));
  };
  const computeNominal = s => {
    const F = toNum(s.amount),
          G = toNum(s.yieldValue),
          H = toNum(s.highestYield),
          I = toNum(s.proporsiHighest),
          J = toNum(s.proporsiNC),
          isNC = String(s.yieldValue).trim().toLowerCase() === 'nc';
    if (isNC)      return !isNaN(J) ? +(F * J / 100).toFixed(2) : 'cek lagi';
    if (isNaN(F)||isNaN(G)||isNaN(H)) return 'cek lagi';
    if (G < H)     return +F.toFixed(2);
    if (G > H)     return 0;
    return !isNaN(I) ? +(F * I / 100).toFixed(2) : 'cek lagi';
  };

  const totalJumlah  = confirmed.reduce((sum,s) => sum + toNum(s.amount), 0);
  const totalNominal = confirmed.reduce((sum,s) => {
    const nom = computeNominal(s);
    return sum + (typeof nom === 'number' ? nom : 0);
  }, 0);

  const [confirmRow, setConfirmRow] = useState(null);
  const [showNotif, setShowNotif]   = useState(false);

  const handleYes = () => {
    setSubs(subs => subs.map((s, idx) =>
      idx === confirmRow
        ? {
            ...s,
            _won: computeNominal(s),
            _wonNotif: true,
            announcementConfirmed: true
          }
        : s
    ));
    setShowNotif(true);
    setConfirmRow(null);
  };

  return (
    <div style={styles.bankWrapper}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <button onClick={onBack} style={styles.backButton}>&larr; Kembali</button>
        <button onClick={onInputSource} style={styles.primaryButton}>Input Source</button>
        <button onClick={onLogout} style={styles.logoutButton}>Logout</button>
      </div>
      <h3 style={{ ...styles.pageTitle, fontSize: '1.25rem' }}>
        Pengumuman Lelang — {lelangType}
      </h3>
      {confirmed.length === 0 ? (
        <p style={{ ...styles.subtitle, color: '#374151' }}>Belum ada pengumuman.</p>
      ) : (
        <table style={{ ...styles.tableWide, fontSize: '0.85rem' }}>
          <thead>
            <tr>
              {[
                'Seri','Nama Bank','Jumlah','Yield Bidding',
                'Yield Tertinggi','Porsi Highest (%)',
                'Proporsi NC (%)','Nominal Dimenangkan (M)','Aksi'
              ].map((h,i) => (
                <th key={i} style={styles.colCenter}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {confirmed.map((s,i) => (
              <tr key={i} style={i % 2 ? styles.rowOdd : styles.rowEven}>
                <td style={styles.colCenter}>{s.series}</td>
                <td style={styles.colCenter}>{s.bank}</td>
                <td style={styles.colCenter}>{s.amount}</td>
                <td style={styles.colCenter}>{s.yieldValue}</td>
                <td style={styles.colCenter}>{s.highestYield}</td>
                <td style={styles.colCenter}>{s.proporsiHighest}</td>
                <td style={styles.colCenter}>{s.proporsiNC}</td>
                <td style={styles.colCenter}>{computeNominal(s)}</td>
                <td style={styles.colCenter}>
                  <button
                    onClick={() => setConfirmRow(i)}
                    disabled={s.announcementConfirmed}
                    style={{
                      ...styles.primaryButton,
                      backgroundColor: s.announcementConfirmed
                        ? styles.secondaryButton.backgroundColor
                        : styles.primaryButton.backgroundColor,
                      cursor: s.announcementConfirmed ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Konfirmasi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={styles.totalRow}>
              <td style={styles.colCenter}><strong>Total</strong></td>
              <td style={styles.col}></td>
              <td style={styles.colCenter}><strong>{totalJumlah.toFixed(2)}</strong></td>
              <td style={styles.col}></td>
              <td style={styles.col}></td>
              <td style={styles.col}></td>
              <td style={styles.col}></td>
              <td style={styles.colCenter}><strong>{totalNominal.toFixed(2)}</strong></td>
              <td style={styles.col}></td>
            </tr>
          </tfoot>
        </table>
      )}
      {confirmRow !== null && (
        <div style={styles.overlay}>
          <div style={styles.confirmDialog}>
            <p>Apakah anda yakin semua informasi sudah sesuai?</p>
            <div style={styles.confirmButtons}>
              <button onClick={() => setConfirmRow(null)} style={styles.secondaryButton}>Tidak</button>
              <button onClick={handleYes} style={styles.primaryButton}>Ya</button>
            </div>
          </div>
        </div>
      )}
      {showNotif && (
        <div style={styles.overlay}>
          <div style={styles.confirmDialog}>
            <p>Notifikasi telah dikirim</p>
            <div style={styles.confirmButtons}>
              <button onClick={() => setShowNotif(false)} style={styles.primaryButton}>Ya</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//
// 3d) InputSourcePage — unchanged
//
function InputSourcePage({ submissions, setSubs, onBack, onLogout, lelangType }) {
  const confirmed = submissions.filter(s => s.confirmed && s.type === lelangType);
  const seriesList = [...new Set(confirmed.map(s => s.series))];
  const [data, setData] = useState({});
  const [confirmRow, setConfirmRow] = useState(null);
  const [showNotif, setShowNotif] = useState(false);

  const handleChange = (seri, field, e) => {
    setData(d => ({
      ...d,
      [seri]: { ...d[seri], [field]: e.target.value }
    }));
  };

  const handleYes = () => {
    const seri = seriesList[confirmRow];
    const { highestYield, proporsiHighest, proporsiNC } = data[seri] || {};
    setSubs(subs => subs.map(s =>
      s.confirmed && s.series === seri
        ? {
            ...s,
            highestYield:    highestYield || '',
            proporsiHighest: proporsiHighest || '',
            proporsiNC:      proporsiNC || ''
          }
        : s
    ));
    setConfirmRow(null);
    setShowNotif(true);
  };

  return (
    <div style={styles.bankWrapper}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <button onClick={onBack} style={styles.backButton}>&larr; Kembali</button>
        <button onClick={onLogout} style={styles.logoutButton}>Logout</button>
      </div>
      <h3 style={styles.pageTitle}>Input Source — {lelangType}</h3>
      {seriesList.length === 0 ? (
        <p style={{ ...styles.subtitle, color: '#374151' }}>Belum ada data untuk di-input.</p>
      ) : (
        <table style={styles.tableWide}>
          <thead>
            <tr>
              <th style={styles.colCenter}>Seri</th>
              <th style={styles.colCenter}>Highest Yield</th>
              <th style={styles.colCenter}>Porsi Highest (%)</th>
              <th style={styles.colCenter}>Proporsi NC (%)</th>
              <th style={styles.colCenter}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {seriesList.map((seri, i) => (
              <tr key={seri} style={i % 2 ? styles.rowOdd : styles.rowEven}>
                <td style={styles.colCenter}>{seri}</td>
                <td style={styles.colCenter}>
                  <input
                    type="number"
                    value={data[seri]?.highestYield||''}
                    onChange={e => handleChange(seri,'highestYield',e)}
                    style={{ ...styles.input, margin: 0, width: '100%' }}
                  />
                </td>
                <td style={styles.colCenter}>
                  <input
                    type="number"
                    value={data[seri]?.proporsiHighest||''}
                    onChange={e => handleChange(seri,'proporsiHighest',e)}
                    style={{ ...styles.input, margin: 0, width: '100%' }}
                  />
                </td>
                <td style={styles.colCenter}>
                  <input
                    type="number"
                    value={data[seri]?.proporsiNC||''}
                    onChange={e => handleChange(seri,'proporsiNC',e)}
                    style={{ ...styles.input, margin: 0, width: '100%' }}
                  />
                </td>
                <td style={styles.colCenter}>
                  <button
                    style={styles.primaryButton}
                    disabled={confirmRow === i}
                    onClick={() => setConfirmRow(i)}
                  >
                    Konfirmasi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {confirmRow !== null && (
        <div style={styles.overlay}>
          <div style={styles.confirmDialog}>
            <p>Apakah anda yakin semua informasi sudah sesuai?</p>
            <div style={styles.confirmButtons}>
              <button onClick={() => setConfirmRow(null)} style={styles.secondaryButton}>Tidak</button>
              <button onClick={handleYes} style={styles.primaryButton}>Ya</button>
            </div>
          </div>
        </div>
      )}
      {showNotif && (
        <div style={styles.overlay}>
          <div style={styles.confirmDialog}>
            <p>Keterangan telah diinput</p>
            <div style={styles.confirmButtons}>
              <button onClick={() => setShowNotif(false)} style={styles.primaryButton}>Ya</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//
// 4) App — routes & global state
//
export default function App() {
  const [page, setPage] = useState('landing');
  const [bankName, setBank] = useState('');
  const [bankType, setBankType] = useState('');
  const [dealerType, setDealerType] = useState('');
  const [submissions, setSubs] = useState([]);

  // flows...
  const goBank = () => setPage('loginBank');
  const doBank = name => { setBank(name); setPage('chooseBankType'); };
  const goBackBankLogin = () => setPage('landing');
  const chooseBankType = type => { setBankType(type); setPage('bank'); };
  const goDealer = () => setPage('loginDealer');
  const doDealer = () => setPage('chooseDealerType');
  const goBackDealerLogin = () => setPage('landing');
  const chooseDealerType = type => { setDealerType(type); setPage('dealer'); };
  const doLogout = () => setPage('landing');
  const goAnnouncement = () => setPage('announcement');
  const goBackAnnouncement = () => setPage('dealer');
  const goInputSource = () => setPage('inputSource');
  const goBackInputSource = () => setPage('announcement');
  const addSubmission = entry => setSubs(arr => [...arr, entry]);

  switch (page) {
    case 'landing':
      return <Landing onBank={goBank} onDealer={goDealer} />;
    case 'loginBank':
      return <LoginBank onSubmit={doBank} onBack={goBackBankLogin} />;
    case 'chooseBankType':
      return <ChooseTypePage onSelect={chooseBankType} onBack={goBackBankLogin} />;
    case 'bank':
      return (
        <BankPage
          bankName={bankName}
          lelangType={bankType}
          submissions={submissions}
          addSubmission={addSubmission}
          onBackToLogin={() => setPage('chooseBankType')}
          onLogout={doLogout}
        />
      );
    case 'loginDealer':
      return <LoginDealer onSubmit={doDealer} onBack={goBackDealerLogin} />;
    case 'chooseDealerType':
      return <ChooseTypePage onSelect={chooseDealerType} onBack={goBackDealerLogin} />;
    case 'dealer':
      return (
        <DealerPage
          submissions={submissions}
          setSubs={setSubs}
          lelangType={dealerType}
          onBackToLogin={() => setPage('chooseDealerType')}
          onLogout={doLogout}
          onAnnouncement={goAnnouncement}
        />
      );
    case 'announcement':
      return (
        <AnnouncementPage
          submissions={submissions}
          setSubs={setSubs}
          lelangType={dealerType}
          onBack={goBackAnnouncement}
          onInputSource={goInputSource}
          onLogout={doLogout}
        />
      );
    case 'inputSource':
      return (
        <InputSourcePage
          submissions={submissions}
          setSubs={setSubs}
          lelangType={dealerType}
          onBack={goBackInputSource}
          onLogout={doLogout}
        />
      );
    default:
      return null;
  }
}

//
// 5) Styles — updated for full-width headers & centered cells
//
const styles = {
  landingWrapper: {
    position: 'fixed', top: 0, left: 0,
    width: '100%', height: '100%',
    background: "linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),url('/Gedung-BNI.png') center/cover no-repeat",
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
  },
  loginWrapper: {
    width: '100vw', height: '100vh',
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff', padding: 24, boxSizing: 'border-box'
  },
  bankWrapper: {
    width: '100vw', minHeight: '100vh', backgroundColor: '#fff',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    paddingTop: 80, paddingBottom: 40, boxSizing: 'border-box', position: 'relative'
  },
  bankRow: {
    display: 'flex', gap: 32,
    justifyContent: 'center', alignItems: 'flex-start',
    width: '100%', maxWidth: 1200, margin: '0 auto'
  },
  inputCol: {
    flex: '0 0 420px'
  },
  tableCol: {
    flex: '1', overflowX: 'auto'
  },
  logoLarge: { width: 350, height: 'auto', marginBottom: 24 },
  title: { fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', textAlign: 'center', margin: '16px 0' },
  subtitle: { fontSize: '1rem', color: '#fff', textAlign: 'center', marginBottom: 24, maxWidth: 600 },
  buttonGroup: { display: 'flex', gap: 16 },
  primaryButton: {
    padding: '14px 28px', fontSize: '1rem',
    backgroundColor: '#2563EB', color: '#fff',
    border: 'none', borderRadius: 4, cursor: 'pointer'
  },
  secondaryButton: {
    padding: '12px 24px', backgroundColor: '#9CA3AF', color: '#fff',
    border: 'none', borderRadius: 4, cursor: 'not-allowed', opacity: 0.6
  },
  footer: { marginTop: 40, color: '#fff' },
  pageTitle: { marginBottom: 16, color: '#0B4C5F', fontSize: '1.75rem' },
  form: { display: 'flex', flexDirection: 'column' },
  label: { marginBottom: 8, fontSize: '1rem', color: '#374151' },
  input: { padding: 12, fontSize: '1rem', border: '1px solid #D1D5DB', borderRadius: 4, width: '100%', marginBottom: 16 },
  backButton: { marginBottom: 24, background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontSize: '1rem' },
  logoutButton: { backgroundColor: '#EF4444', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: 4, cursor: 'pointer' },
  countdown: { marginBottom: 12, color: '#0B4C5F', fontSize: '1.75rem', fontWeight: 'bold', textAlign: 'left' },
  tableWide: {
    width: '100%', borderCollapse: 'collapse', marginBottom: 16,
    fontSize: '1rem', tableLayout: 'auto'
  },
  table: {
    width: '100%', borderCollapse: 'collapse', marginBottom: 16,
    fontSize: '1rem', tableLayout: 'fixed'
  },
  col: { padding: '8px 12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  colCenter: { padding: '8px 12px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rowEven: { backgroundColor: '#F9FAFB' },
  rowOdd: { backgroundColor: '#FFFFFF' },
  finalButton: { marginTop: 16, padding: '14px 28px', fontSize: '1rem', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  deleteButton: { background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '1rem' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  confirmDialog: { background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
  confirmButtons: { display: 'flex', justifyContent: 'flex-end', gap: 16 },
  errorText: { color: 'red', fontSize: 12 },
  totalRow: { backgroundColor: '#ECFDF5' }
};
