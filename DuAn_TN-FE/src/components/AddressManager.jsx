import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Radio, Checkbox, FormControlLabel, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import AddressSelector from './AddressSelector';
import config from '../config/config';
import { getCustomerId } from '../utils/authUtils';

const AddressManager = ({
    customerId,
    onSelect,
    selectedId,
    showSelection = true
}) => {
    const addressStorageKey = `savedAddresses_${customerId || 'guest'}`;
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [modalMode, setModalMode] = useState('list'); // 'list' | 'form'
    const [editingAddress, setEditingAddress] = useState(null);
    const [openForm, setOpenForm] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [provinceId, setProvinceId] = useState(null);
    const [districtId, setDistrictId] = useState(null);
    const [wardCode, setWardCode] = useState(null);
    const [addressDetail, setAddressDetail] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem(addressStorageKey);
        if (raw) {
            setSavedAddresses(JSON.parse(raw));
        }
    }, [addressStorageKey]);

    const handleSetDefault = (id) => {
        const updated = savedAddresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id
        }));
        setSavedAddresses(updated);
        localStorage.setItem(addressStorageKey, JSON.stringify(updated));
        toast.success('Đã đặt địa chỉ mặc định');
    };

    const handleOpenForm = (addr = null) => {
        if (addr) {
            setEditingAddress(addr);
            setName(addr.name || '');
            setPhone(addr.phone || '');
            setEmail(addr.email || '');
            setProvinceId(addr.provinceId || null);
            setDistrictId(addr.districtId || null);
            setWardCode(addr.wardCode || null);
            setAddressDetail(addr.addressDetail || '');
            setIsDefault(!!addr.isDefault);
        } else {
            setEditingAddress(null);
            setName('');
            setPhone('');
            setEmail('');
            setProvinceId(null);
            setDistrictId(null);
            setWardCode(null);
            setAddressDetail('');
            setIsDefault(savedAddresses.length === 0);
        }
        setOpenForm(true);
    };

    const handleSave = async () => {
        if (!name || !phone || !email || !provinceId || !districtId || !wardCode || !addressDetail) {
            toast.warning('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        // Simulating full address construction (normally you'd get names from GHN API)
        // For simplicity, we'll store the IDs and let the parent component resolve names if needed, 
        // or we can fetch names here. Payment.js does it in resolveFullAddressFromCodes.
        
        // Let's try to get names from AddressSelector if possible, but AddressSelector is a black box here.
        // We'll just save the IDs and provide a utility or let the parent handle it.
        // Actually, let's just use the logic from Payment.js
        
        const newAddr = {
            id: editingAddress ? editingAddress.id : Date.now(),
            name,
            phone,
            email,
            provinceId,
            districtId,
            wardCode,
            addressDetail,
            isDefault
        };

        let updated;
        if (editingAddress) {
            updated = savedAddresses.map(a => {
                if (a.id === editingAddress.id) return newAddr;
                if (isDefault) return { ...a, isDefault: false };
                return a;
            });
        } else {
            updated = isDefault
                ? [...savedAddresses.map(a => ({ ...a, isDefault: false })), newAddr]
                : [...savedAddresses, newAddr];
        }

        setSavedAddresses(updated);
        localStorage.setItem(addressStorageKey, JSON.stringify(updated));
        setOpenForm(false);
        toast.success(editingAddress ? 'Cập nhật thành công' : 'Thêm địa chỉ thành công');
        
        if (onSelect && !editingAddress) {
            onSelect(newAddr);
        }
    };

    const handleDelete = (id) => {
        const updated = savedAddresses.filter(a => a.id !== id);
        setSavedAddresses(updated);
        localStorage.setItem(addressStorageKey, JSON.stringify(updated));
        toast.info('Đã xóa địa chỉ');
    };

    const prettyAddress = (addr) => {
        if (!addr) return '';
        if (addr.fullAddress) return addr.fullAddress;
        return `${addr.addressDetail} (Mã: ${addr.wardCode}, ${addr.districtId}, ${addr.provinceId})`;
    };

    return (
        <div className="address-manager">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>Địa chỉ của tôi</h3>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm()}
                    size="small"
                >
                    Thêm địa chỉ mới
                </Button>
            </div>

            {savedAddresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                    Chưa có địa chỉ nào được lưu.
                </div>
            ) : (
                <div className="address-list">
                    {savedAddresses.map(addr => (
                        <div key={addr.id} style={{
                            padding: '12px',
                            border: '1px solid #f0f0f0',
                            borderRadius: 8,
                            marginBottom: 12,
                            display: 'flex',
                            gap: 12,
                            alignItems: 'flex-start',
                            backgroundColor: selectedId === addr.id ? '#f0f7ff' : '#fff'
                        }}>
                            {showSelection && (
                                <Radio
                                    checked={selectedId === addr.id}
                                    onChange={() => onSelect && onSelect(addr)}
                                    size="small"
                                />
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600 }}>{addr.name}</span>
                                    <span style={{ color: '#ccc' }}>|</span>
                                    <span style={{ color: '#666' }}>{addr.phone}</span>
                                    {addr.isDefault && (
                                        <span style={{
                                            fontSize: '11px',
                                            color: '#ff4d4f',
                                            border: '1px solid #ff4d4f',
                                            padding: '0 4px',
                                            borderRadius: 2
                                        }}>Mặc định</span>
                                    )}
                                </div>
                                <div style={{ fontSize: '13px', color: '#666' }}>{prettyAddress(addr)}</div>
                                
                                <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
                                    {!addr.isDefault && (
                                        <Button 
                                            size="small" 
                                            onClick={() => handleSetDefault(addr.id)}
                                            style={{ padding: 0, textTransform: 'none', fontSize: '12px' }}
                                        >
                                            Thiết lập mặc định
                                        </Button>
                                    )}
                                    <Button 
                                        size="small" 
                                        startIcon={<EditIcon style={{ fontSize: 16 }} />}
                                        onClick={() => handleOpenForm(addr)}
                                        style={{ padding: 0, textTransform: 'none', fontSize: '12px' }}
                                    >
                                        Cập nhật
                                    </Button>
                                    {!addr.isDefault && (
                                        <Button 
                                            size="small" 
                                            color="error"
                                            onClick={() => handleDelete(addr.id)}
                                            style={{ padding: 0, textTransform: 'none', fontSize: '12px' }}
                                        >
                                            Xóa
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingAddress ? 'Cập nhật địa chỉ' : 'Địa chỉ mới'}</DialogTitle>
                <DialogContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 10 }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <input 
                                placeholder="Họ và tên" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                style={{ flex: 1, padding: '8px', borderRadius: 4, border: '1px solid #ddd' }}
                            />
                            <input 
                                placeholder="Số điện thoại" 
                                value={phone} 
                                onChange={e => setPhone(e.target.value)} 
                                style={{ flex: 1, padding: '8px', borderRadius: 4, border: '1px solid #ddd' }}
                            />
                        </div>
                        <input 
                            placeholder="Email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            style={{ padding: '8px', borderRadius: 4, border: '1px solid #ddd' }}
                        />
                        <AddressSelector
                            selectedProvince={provinceId}
                            selectedDistrict={districtId}
                            selectedWard={wardCode}
                            onProvinceChange={setProvinceId}
                            onDistrictChange={setDistrictId}
                            onWardChange={setWardCode}
                        />
                        <input 
                            placeholder="Số nhà, tên đường..." 
                            value={addressDetail} 
                            onChange={e => setAddressDetail(e.target.value)} 
                            style={{ padding: '8px', borderRadius: 4, border: '1px solid #ddd' }}
                        />
                        <FormControlLabel
                            control={<Checkbox checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />}
                            label="Đặt làm địa chỉ mặc định"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenForm(false)}>Trở lại</Button>
                    <Button variant="contained" onClick={handleSave}>Hoàn thành</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AddressManager;
