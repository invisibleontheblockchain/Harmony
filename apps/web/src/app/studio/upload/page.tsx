'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import WaveSurfer from 'wavesurfer.js';

export default function UploadPage() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [splits, setSplits] = useState([{ holderId: '', percentage: 100 }]);
  const [nftMint, setNftMint] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setTitle(acceptedFiles[0].name.replace(/\.[^/.]+$/, ''));
    setStep(2);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'audio/*': [] } });

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Upload Track</h1>

      <div className="flex items-center gap-2 mb-8">
        {['Upload', 'Metadata', 'Rights & Splits'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > i + 1 || step === i + 1 ? 'bg-[var(--accent-purple)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)]'}`}>
              {i + 1}
            </div>
            <span className="text-sm font-medium">{label}</span>
            {i < 2 && <div className="w-12 h-px bg-[var(--border-default)] mx-2" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div {...getRootProps()} className="card h-64 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--border-accent)] transition">
          <input {...getInputProps()} />
          <p className="text-lg font-medium">{isDragActive ? 'Drop your file here' : 'Drag & drop audio files here'}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">or click to browse • WAV, MP3, FLAC</p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Genre</label>
            <select className="input mt-1" value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="">Select...</option>
              {['Electronic', 'Hip-Hop', 'Rock', 'Jazz', 'Classical', 'Pop', 'Ambient', 'Techno', 'R&B', 'Lo-Fi'].map((g) => (<option key={g} value={g}>{g}</option>))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Cover Art</label>
            <div className="mt-1 h-32 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border-default)] flex items-center justify-center text-[var(--text-tertiary)]">
              Drag or click to upload
            </div>
          </div>
          <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary" onClick={() => setStep(3)}>Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-semibold">Royalty Splits</h2>
          {splits.map((split, i) => (
            <div key={i} className="card flex gap-3 items-center">
              <input className="input flex-1" placeholder="Rights holder address" value={split.holderId} onChange={(e) => { const next = [...splits]; next[i].holderId = e.target.value; setSplits(next); }} />
              <input className="input w-24" type="number" placeholder="%" value={split.percentage} onChange={(e) => { const next = [...splits]; next[i].percentage = Number(e.target.value); setSplits(next); }} />
              {i > 0 && <button onClick={() => setSplits(splits.filter((_, idx) => idx !== i))} className="text-[var(--error)]">Remove</button>}
            </div>
          ))}
          <button className="btn-secondary" onClick={() => setSplits([...splits, { holderId: '', percentage: 0 }])}>Add Rights Holder</button>
          <p className="text-sm text-[var(--text-tertiary)]">Total must equal 100%</p>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mint as NFT</p>
                <p className="text-xs text-[var(--text-secondary)]">Create an NFT edition for this track</p>
              </div>
              <button onClick={() => setNftMint(!nftMint)} className={`w-12 h-6 rounded-full transition ${nftMint ? 'bg-[var(--accent-purple)]' : 'bg-[var(--bg-tertiary)]'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition ${nftMint ? 'translate-x-6' : 'translate-x-0.5 mt-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
            <button className="btn-primary" onClick={() => alert('Upload complete!')}>Publish Track</button>
          </div>
        </div>
      )}
    </div>
  );
}
