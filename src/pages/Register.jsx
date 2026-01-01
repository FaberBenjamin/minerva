import { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useVotingDistrict } from '../contexts/VotingDistrictContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pir: '',
    street: '',
    streetType: '',
    houseNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const { findDistrict, isReady, isLoading: districtLoading } = useVotingDistrict();

  // Közterület jellegek
  const streetTypes = [
    'utca',
    'út',
    'tér',
    'köz',
    'körút',
    'sétány',
    'park',
    'fasor',
    'lépcső',
    'aluljáró',
    'sor',
    'dűlő',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Név validáció
    if (!formData.name.trim()) {
      newErrors.name = 'A név megadása kötelező';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'A névnek legalább 2 karakter hosszúnak kell lennie';
    }

    // Email validáció
    if (!formData.email.trim()) {
      newErrors.email = 'Az email cím megadása kötelező';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Érvénytelen email cím formátum';
    }

    // Telefonszám validáció
    if (!formData.phone.trim()) {
      newErrors.phone = 'A telefonszám megadása kötelező';
    } else if (!/^[\d\s+()-]{6,20}$/.test(formData.phone)) {
      newErrors.phone = 'Érvénytelen telefonszám formátum';
    }

    // PIR (Irányítószám) validáció
    if (!formData.pir.trim()) {
      newErrors.pir = 'Az irányítószám megadása kötelező';
    } else if (!/^\d{4}$/.test(formData.pir)) {
      newErrors.pir = 'Az irányítószámnak 4 számjegyből kell állnia';
    }

    // Közterület név validáció
    if (!formData.street.trim()) {
      newErrors.street = 'A közterület név megadása kötelező';
    }

    // Közterület jelleg validáció
    if (!formData.streetType) {
      newErrors.streetType = 'A közterület jelleg kiválasztása kötelező';
    }

    // Házszám validáció
    if (!formData.houseNumber.trim()) {
      newErrors.houseNumber = 'A házszám megadása kötelező';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Volunteers collection referencia
      const volunteersRef = collection(db, 'volunteers');

      // Teljes cím összeállítása
      const fullAddress = `${formData.pir} ${formData.street} ${formData.streetType} ${formData.houseNumber}`;

      // Cím egyeztetés a választási adatbázisban
      const districtMatch = findDistrict({
        pir: formData.pir,
        street: formData.street,
        streetType: formData.streetType,
        houseNumber: formData.houseNumber
      });

      const volunteerData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        address: {
          pir: formData.pir.trim(),
          street: formData.street.trim(),
          streetType: formData.streetType,
          houseNumber: formData.houseNumber.trim(),
          fullAddress: fullAddress,
        },
        district: districtMatch || {
          oevk: null,
          votingStation: null,
          status: 'unknown', // 'matched' | 'unknown'
        },
        createdAt: serverTimestamp(),
        submittedAt: serverTimestamp(),
      };

      // Mentés Firestore-ba
      await addDoc(volunteersRef, volunteerData);

      setSubmitStatus('success');
      // Form reset
      setFormData({
        name: '',
        email: '',
        phone: '',
        pir: '',
        street: '',
        streetType: '',
        houseNumber: '',
      });

    } catch (error) {
      console.error('Hiba a regisztráció során:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', JSON.stringify(error, null, 2));
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ha még töltődik a választási adatbázis
  if (districtLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <LoadingSpinner text="A választási adatbázis betöltése folyamatban van..." />
          <p className="text-gray-500 text-sm mt-4 text-center">Ez néhány másodpercet vehet igénybe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Önkéntes Regisztráció</h1>
            <p className="text-gray-600">Köszönjük, hogy csatlakozol hozzánk!</p>
          </div>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                Sikeres regisztráció! Köszönjük jelentkezésedet.
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                Hiba történt a regisztráció során. Kérjük, próbáld újra később.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Név */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Teljes név <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Kovács János"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email cím <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="pelda@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Telefonszám */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefonszám <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+36 20 123 4567"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* Cím - egy sorban */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lakcím</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Irányítószám */}
                <div>
                  <label htmlFor="pir" className="block text-sm font-medium text-gray-700 mb-1">
                    Irányítószám <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="pir"
                    name="pir"
                    value={formData.pir}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition ${
                      errors.pir ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1111"
                    maxLength="4"
                  />
                  {errors.pir && <p className="mt-1 text-sm text-red-500">{errors.pir}</p>}
                </div>

                {/* Közterület név */}
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    Közterület név <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition ${
                      errors.street ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Kossuth"
                  />
                  {errors.street && <p className="mt-1 text-sm text-red-500">{errors.street}</p>}
                </div>

                {/* Közterület jelleg */}
                <div>
                  <label htmlFor="streetType" className="block text-sm font-medium text-gray-700 mb-1">
                    Közterület jelleg <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="streetType"
                    name="streetType"
                    value={formData.streetType}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition ${
                      errors.streetType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Válassz...</option>
                    {streetTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.streetType && <p className="mt-1 text-sm text-red-500">{errors.streetType}</p>}
                </div>

                {/* Házszám */}
                <div>
                  <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Házszám <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="houseNumber"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition ${
                      errors.houseNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="12"
                  />
                  {errors.houseNumber && <p className="mt-1 text-sm text-red-500">{errors.houseNumber}</p>}
                </div>
              </div>
            </div>

            {/* Submit gomb */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-medium text-white transition ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-700 focus:ring-4 focus:ring-gray-300'
                }`}
              >
                {isSubmitting ? 'Regisztráció...' : 'Regisztráció'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>A regisztráció elküldésével elfogadod az adatkezelési tájékoztatót.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
