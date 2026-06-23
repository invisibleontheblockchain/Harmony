import essentia.standard as es
import numpy as np

def extract_audio_features(audio_filepath):
    try:
        loader = es.MonoLoader(filename=audio_filepath)
        audio = loader()
        
        rhythm_extractor = es.RhythmExtractor2013(method="multifeature")
        key_extractor = es.KeyExtractor()
        danceability_extractor = es.Danceability()
        energy_extractor = es.Energy()
        
        bpm, beats, beats_confidence, _, _ = rhythm_extractor(audio)
        key, scale, key_strength = key_extractor(audio)
        danceability = danceability_extractor(audio)
        energy = energy_extractor(audio)
        
        w = es.Windowing(type='hann')
        spectrum = es.Spectrum()
        mfcc = es.MFCC()
        
        mfccs = []
        for frame in es.FrameGenerator(audio, frameSize=1024, hopSize=512):
            spec = spectrum(w(frame))
            _, mfcc_coeffs = mfcc(spec)
            mfccs.append(mfcc_coeffs)
        
        mean_mfcc = np.mean(mfccs, axis=0)
        
        features = {
            "bpm": float(bpm),
            "key": f"{key} {scale}",
            "danceability": float(danceability),
            "energy": float(energy),
            "mfcc_vector": mean_mfcc.tolist()
        }
        return features
    except Exception as e:
        print(f"Error extracting features from {audio_filepath}: {str(e)}")
        return None