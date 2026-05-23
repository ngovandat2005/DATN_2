package com.example.backend.service;

import com.example.backend.KhongTimThay;
import com.example.backend.dto.NhanVienDTO;
import com.example.backend.entity.NhanVien;
import com.example.backend.repository.NhanVienRepository;
import com.example.backend.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NhanVienService {

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private PasswordUtil passwordUtil;
    
    // ham convert entity sang dto
    public NhanVienDTO convertDTO (NhanVien nv){
        return new NhanVienDTO(
          nv.getId(),
          nv.getTenNhanVien(),
          nv.getEmail(),
          nv.getSoDienThoai(),
          nv.getNgaySinh(),
          nv.getDiaChi(),
          nv.getVaiTro(),
          nv.getCccd(),
          nv.getTrangThai()
        );
    }
    
    // ham lay all nhan vien (chi lay nhan vien thuong, khong lay admin/quan ly)
    public List<NhanVienDTO> findall(){
        return nhanVienRepository.findAll().stream()
                .filter(nhanVien -> nhanVien.getVaiTro() == null || !nhanVien.getVaiTro())
                .map(nhanVien -> new NhanVienDTO(
                        nhanVien.getId(),
                        nhanVien.getTenNhanVien(),
                        nhanVien.getEmail(),
                        nhanVien.getSoDienThoai(),
                        nhanVien.getNgaySinh(),
                        nhanVien.getDiaChi(),
                        nhanVien.getVaiTro(),
                        nhanVien.getCccd(),
                        nhanVien.getTrangThai()
                ))
                .toList();
    }
    
    //ham lay danh sach theo id
    public NhanVienDTO findById(Integer id){
        return nhanVienRepository.findById(id)
                .map(nhanVien -> new NhanVienDTO(
                        nhanVien.getId(),
                        nhanVien.getTenNhanVien(),
                        nhanVien.getEmail(),
                        nhanVien.getSoDienThoai(),
                        nhanVien.getNgaySinh(),
                        nhanVien.getDiaChi(),
                        nhanVien.getVaiTro(),
                        nhanVien.getCccd(),
                        nhanVien.getTrangThai()
                ))
                .orElse(null);
    }
    
    // ham create nhanvien
    public NhanVienDTO create(NhanVienDTO dto){
        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            if (nhanVienRepository.findByEmail(dto.getEmail().trim()).isPresent()) {
                throw new RuntimeException("Email đã tồn tại!");
            }
        }
        if (dto.getSoDienThoai() != null && !dto.getSoDienThoai().trim().isEmpty()) {
            if (nhanVienRepository.findBySoDienThoai(dto.getSoDienThoai().trim()).isPresent()) {
                throw new RuntimeException("Số điện thoại đã tồn tại!");
            }
        }
        if (dto.getCccd() != null && !dto.getCccd().trim().isEmpty()) {
            if (nhanVienRepository.findByCccd(dto.getCccd().trim()).isPresent()) {
                throw new RuntimeException("CCCD đã tồn tại!");
            }
        }

        NhanVien nv = new NhanVien();
        nv.setTenNhanVien(dto.getTenNhanVien());
        nv.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);
        nv.setSoDienThoai(dto.getSoDienThoai() != null ? dto.getSoDienThoai().trim() : null);
        nv.setNgaySinh(dto.getNgaySinh());
        nv.setDiaChi(dto.getDiaChi());
        nv.setVaiTro(dto.getVaiTro());
        nv.setCccd(dto.getCccd() != null ? dto.getCccd().trim() : null);
        nv.setTrangThai(dto.getTrangThai());
        if (dto.getMatKhau() != null && !dto.getMatKhau().trim().isEmpty()) {
            nv.setMatKhau(passwordUtil.encode(dto.getMatKhau().trim()));
        }
        return convertDTO(nhanVienRepository.save(nv));
    }

    public void datMatKhau(Integer id, String matKhau) {
        NhanVien nv = nhanVienRepository.findById(id)
                .orElseThrow(() -> new KhongTimThay("Không tìm thấy nhân viên!"));
        if (matKhau == null || matKhau.trim().isEmpty()) {
            throw new RuntimeException("Mật khẩu không được để trống!");
        }
        nv.setMatKhau(passwordUtil.encode(matKhau.trim()));
        nhanVienRepository.save(nv);
    }

    // ham delete nhan vien (soft delete)
    public boolean delete(Integer id){
        Optional<NhanVien> optional = nhanVienRepository.findById(id);
        if (optional.isPresent()) {
            NhanVien nv = optional.get();
            nv.setTrangThai(false);
            nhanVienRepository.save(nv);
            return true;
        }
        return false;
    }

    //ham update nhan vien
    public NhanVienDTO update (int id, NhanVienDTO dto){
        return nhanVienRepository.findById(id)
                .map( nhanVien -> {
                    if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
                        Optional<NhanVien> duplicateEmail = nhanVienRepository.findByEmail(dto.getEmail().trim());
                        if (duplicateEmail.isPresent() && !duplicateEmail.get().getId().equals(id)) {
                            throw new RuntimeException("Email đã tồn tại!");
                        }
                    }
                    if (dto.getSoDienThoai() != null && !dto.getSoDienThoai().trim().isEmpty()) {
                        Optional<NhanVien> duplicatePhone = nhanVienRepository.findBySoDienThoai(dto.getSoDienThoai().trim());
                        if (duplicatePhone.isPresent() && !duplicatePhone.get().getId().equals(id)) {
                            throw new RuntimeException("Số điện thoại đã tồn tại!");
                        }
                    }
                    if (dto.getCccd() != null && !dto.getCccd().trim().isEmpty()) {
                        Optional<NhanVien> duplicateCccd = nhanVienRepository.findByCccd(dto.getCccd().trim());
                        if (duplicateCccd.isPresent() && !duplicateCccd.get().getId().equals(id)) {
                            throw new RuntimeException("CCCD đã tồn tại!");
                        }
                    }

                    nhanVien.setTenNhanVien(dto.getTenNhanVien());
                    nhanVien.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);
                    nhanVien.setSoDienThoai(dto.getSoDienThoai() != null ? dto.getSoDienThoai().trim() : null);
                    nhanVien.setNgaySinh(dto.getNgaySinh());
                    nhanVien.setDiaChi(dto.getDiaChi());
                    nhanVien.setVaiTro(dto.getVaiTro());
                    nhanVien.setCccd(dto.getCccd() != null ? dto.getCccd().trim() : null);
                    nhanVien.setTrangThai(dto.getTrangThai());
                    if (dto.getMatKhau() != null && !dto.getMatKhau().trim().isEmpty()) {
                        nhanVien.setMatKhau(passwordUtil.encode(dto.getMatKhau().trim()));
                    }
                    return convertDTO(nhanVienRepository.save(nhanVien));
                })
                .orElse(null);
    }
}
