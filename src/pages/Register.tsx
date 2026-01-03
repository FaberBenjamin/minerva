import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import votingDistrictService from '../services/votingDistrictService';
import type { DistrictRecord } from '../types';

type SubmitStatus = 'success' | 'error' | null;

interface FormData {
  name: string;
  email: string;
  phone: string;
  pir: string;
  addressSearch: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  pir?: string;
  addressSearch?: string;
}

interface SelectedAddress {
  street: string;
  streetType: string;
  houseNumber: string;
  oevk: string;
  votingStation: string;
  fullAddress: string;
}

const Register = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    pir: '',
    addressSearch: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);

  // PIR-hez tartozó címek
  const [availableAddresses, setAvailableAddresses] = useState<DistrictRecord[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [pirError, setPirError] = useState<string | null>(null);

  // Kiválasztott cím
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);

  // Autocomplete dropdown
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredAddresses, setFilteredAddresses] = useState<DistrictRecord[]>([]);

  // PIR betöltése amikor a felhasználó kitölti
  const loadAddressesForPir = async (pir: string) => {
    if (!pir || !/^\d{4}$/.test(pir)) {
      setAvailableAddresses([]);
      setPirError(null);
      return;
    }

    setLoadingAddresses(true);
    setPirError(null);

    try {
      const addresses = await votingDistrictService.loadPirData(pir);

      if (addresses.length === 0) {
        setPirError('Nincs elérhető cím ehhez az irányítószámhoz');
        setAvailableAddresses([]);
      } else {
        setAvailableAddresses(addresses);
        setPirError(null);
      }
    } catch (error) {
      console.error('Hiba a címek betöltésekor:', error);
      setPirError('Nem sikerült betölteni a címeket');
      setAvailableAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // PIR mező változásakor
  const handlePirChange = (e: ChangeEvent<HTMLInputElement>) => {
    const pir = e.target.value;
    setFormData(prev => ({ ...prev, pir }));
    setSelectedAddress(null);
    setFormData(prev => ({ ...prev, addressSearch: '' }));

    if (errors.pir) {
      setErrors(prev => ({ ...prev, pir: '' }));
    }
  };

  // PIR mező blur eseményre betöltjük a címeket
  const handlePirBlur = () => {
    if (formData.pir && /^\d{4}$/.test(formData.pir)) {
      loadAddressesForPir(formData.pir);
    }
  };

  // Cím keresés (autocomplete)
  const handleAddressSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setFormData(prev => ({ ...prev, addressSearch: search }));
    setSelectedAddress(null);

    if (errors.addressSearch) {
      setErrors(prev => ({ ...prev, addressSearch: '' }));
    }

    // Szűrés
    if (search.trim() && availableAddresses.length > 0) {
      const normalizedSearch = search.toLowerCase().trim();
      const filtered = availableAddresses.filter(addr => {
        const fullAddr = `${addr['Közterület név']} ${addr['Közterület jelleg']} ${addr['Házszám']}`.toLowerCase();
        return fullAddr.includes(normalizedSearch);
      });
      setFilteredAddresses(filtered.slice(0, 50)); // Max 50 találat
      setShowDropdown(true);
    } else {
      setFilteredAddresses([]);
      setShowDropdown(false);
    }
  };

  // Házszám normalizálás (leading zeros eltávolítása)
  const normalizeHouseNumber = (houseNumber: string): string => {
    if (!houseNumber) return '';
    let normalized = houseNumber.trim().toUpperCase();
    normalized = normalized.replace(/^0+/, '') || '0';
    return normalized;
  };

  // Cím kiválasztása a dropdown-ból
  const handleSelectAddress = (address: DistrictRecord) => {
    const normalizedHouseNumber = normalizeHouseNumber(address['Házszám']);
    const fullAddress = `${formData.pir} ${address['Közterület név']} ${address['Közterület jelleg']} ${normalizedHouseNumber}`;

    setSelectedAddress({
      street: address['Közterület név'],
      streetType: address['Közterület jelleg'],
      houseNumber: address['Házszám'],
      oevk: address.OEVK,
      votingStation: address['Szavazókör'],
      fullAddress
    });

    setFormData(prev => ({
      ...prev,
      addressSearch: `${address['Közterület név']} ${address['Közterület jelleg']} ${normalizedHouseNumber}`
    }));

    setShowDropdown(false);
    setFilteredAddresses([]);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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

    // PIR validáció
    if (!formData.pir.trim()) {
      newErrors.pir = 'Az irányítószám megadása kötelező';
    } else if (!/^\d{4}$/.test(formData.pir)) {
      newErrors.pir = 'Az irányítószámnak 4 számjegyből kell állnia';
    }

    // Cím validáció
    if (!selectedAddress) {
      newErrors.addressSearch = 'Kérlek válassz egy címet a listából';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm() || !selectedAddress) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const volunteersRef = collection(db, 'volunteers');

      const volunteerData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        address: {
          pir: formData.pir.trim(),
          street: selectedAddress.street,
          streetType: selectedAddress.streetType,
          houseNumber: selectedAddress.houseNumber,
          fullAddress: selectedAddress.fullAddress,
        },
        district: {
          oevk: selectedAddress.oevk,
          votingStation: selectedAddress.votingStation,
          status: 'matched' as const,
        },
        createdAt: serverTimestamp(),
        submittedAt: serverTimestamp(),
      };

      await addDoc(volunteersRef, volunteerData);

      setSubmitStatus('success');
      // Form reset
      setFormData({
        name: '',
        email: '',
        phone: '',
        pir: '',
        addressSearch: '',
      });
      setSelectedAddress(null);
      setAvailableAddresses([]);
      setPirError(null);

    } catch (error) {
      console.error('Hiba a regisztráció során:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kattintás detektálás a dropdown bezárásához
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

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

            {/* Cím szekció */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lakcím</h3>

              {/* Irányítószám */}
              <div className="mb-4">
                <label htmlFor="pir" className="block text-sm font-medium text-gray-700 mb-1">
                  Irányítószám <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="pir"
                  name="pir"
                  value={formData.pir}
                  onChange={handlePirChange}
                  onBlur={handlePirBlur}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition ${
                    errors.pir ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1111"
                  maxLength={4}
                />
                {errors.pir && <p className="mt-1 text-sm text-red-500">{errors.pir}</p>}
                {loadingAddresses && (
                  <p className="mt-1 text-sm text-blue-600">Címek betöltése...</p>
                )}
                {pirError && (
                  <p className="mt-1 text-sm text-orange-600">{pirError}</p>
                )}
                {availableAddresses.length > 0 && (
                  <p className="mt-1 text-sm text-green-600">
                    {availableAddresses.length} elérhető cím betöltve
                  </p>
                )}
              </div>

              {/* Cím keresés (autocomplete) */}
              <div className="relative">
                <label htmlFor="addressSearch" className="block text-sm font-medium text-gray-700 mb-1">
                  Cím <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="addressSearch"
                  name="addressSearch"
                  value={formData.addressSearch}
                  onChange={handleAddressSearchChange}
                  onFocus={() => {
                    if (filteredAddresses.length > 0) {
                      setShowDropdown(true);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  disabled={!availableAddresses.length || loadingAddresses}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition ${
                    errors.addressSearch ? 'border-red-500' : 'border-gray-300'
                  } ${!availableAddresses.length || loadingAddresses ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder={availableAddresses.length ? "Kezd el gépelni a címet..." : "Előbb add meg az irányítószámot"}
                  autoComplete="off"
                />
                {errors.addressSearch && <p className="mt-1 text-sm text-red-500">{errors.addressSearch}</p>}

                {/* Autocomplete dropdown */}
                {showDropdown && filteredAddresses.length > 0 && (
                  <div
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {filteredAddresses.map((addr, index) => {
                      const normalizedHouseNumber = normalizeHouseNumber(addr['Házszám']);
                      const displayAddress = `${addr['Közterület név']} ${addr['Közterület jelleg']} ${normalizedHouseNumber}`;
                      return (
                        <div
                          key={`${addr.OEVK}-${addr['Szavazókör']}-${index}`}
                          onClick={() => handleSelectAddress(addr)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{displayAddress}</div>
                          <div className="text-xs text-gray-500">
                            {addr.Település} - OEVK: {addr.OEVK}, Szavazókör: {addr['Szavazókör']}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {showDropdown && formData.addressSearch && filteredAddresses.length === 0 && availableAddresses.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                    <p className="text-sm text-gray-600">Nincs találat. Próbálj más keresési kifejezést.</p>
                  </div>
                )}
              </div>

              {/* Kiválasztott cím megjelenítése */}
              {selectedAddress && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Kiválasztott cím:</span> {selectedAddress.fullAddress}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    OEVK: {selectedAddress.oevk}, Szavazókör: {selectedAddress.votingStation}
                  </p>
                </div>
              )}
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
