# TFT Handbook — Tạo đội hình

Website HTML/CSS/JavaScript thuần. Mở `index.html` bằng Chrome hoặc Edge để dùng offline; không cần cài Node.js, React hay chạy server.

## Cách sử dụng

- **TƯỚNG:** tra cứu 94 tướng, hiệu ứng, tộc/hệ, kỹ năng và điều kiện mở khóa.
- **TỘC / HỆ:** tra cứu 47 tộc/hệ. Ở tab Tướng, nhấn nút lọc **Tất cả tộc/hệ** để chọn từ bảng icon nhiều cột.
- **TẠO ĐỘI HÌNH:** bấm icon trong **Kho tướng** để thêm. Bấm **×** trên thẻ tướng để xóa. Bấm một thẻ đã chọn để xem gợi ý tướng chung tộc/hệ, bấm lần nữa để trở lại gợi ý cho cả đội.
- Dùng nút **− / +** ở phần *Giới hạn* để chỉnh số suất (1–15, mặc định 10). Không thể giảm xuống ít hơn số suất đang sử dụng. Baron Nashor tính **2 suất**.
- Icon mờ vẫn có thể chọn. Tướng độc lập luôn sáng; Mordekaiser **không** được xem là độc lập vì chung Pentakill với các tướng khác. Baron chỉ sáng khi có Malzahar trong đội, **không có nghĩa là đã hoàn thành điều kiện mở khóa Baron**.
- Đội hình tự lưu trên trình duyệt hiện tại qua `localStorage`. Nút **XÓA ĐỘI HÌNH** xóa ngay toàn bộ tướng đã chọn (không có hộp xác nhận); không đổi giới hạn suất.

## Cấu trúc source

```text
TFT-Handbook-Team-Composer/
├── index.html                 # Website hoàn chỉnh; mở trực tiếp để xem
├── build.py                   # Tạo lại index.html từ source
├── README.md
└── src/
    ├── template.html          # Khung HTML ba tab
    ├── styles/
    │   ├── base.css
    │   ├── traits.css          # Tộc/hệ, cả bảng lọc icon nhiều cột
    │   ├── unlocks.css
    │   └── builder.css         # Giao diện tab TẠO ĐỘI HÌNH
    ├── js/
    │   ├── core.js            # Dữ liệu chung, chuyển tab, bảng lọc tộc/hệ
    │   ├── units-and-filters.js
    │   ├── traits.js
    │   ├── unlocks.js
    │   └── builder.js         # Thêm/xóa tướng, giới hạn suất, gợi ý, tự lưu
    ├── data/                  # JSON tướng, kỹ năng, mở khóa và tộc/hệ
    └── assets/                # Hình tướng và icon tộc/hệ
```

## Chỉnh sửa trong VS Code

1. Giữ branch `dev`, giải nén ZIP rồi **chép nội dung bên trong thư mục** vào repository `TFT-Handbook` (thay file cũ nếu cần).
2. Chỉnh trong `src/` — ví dụ `src/js/builder.js` để sửa logic đội hình, `src/styles/builder.css` để sửa giao diện, `src/template.html` để đổi chữ/nút.
3. Chạy trong Terminal:

   ```powershell
   py build.py
   ```

   Nếu `py` không chạy, thử `python build.py`.
4. Mở lại `index.html` mới và refresh để kiểm tra trước khi commit/push.

**Không sửa trực tiếp `index.html` để phát triển:** `build.py` sẽ ghi đè file đó mỗi khi chạy. Khi đưa lên GitHub + Vercel, cần commit cả `src/` lẫn `index.html` vừa build.

## Nguồn tham khảo

- https://tft.ninja/sets/19/units
- https://tactics.tools/info/set-update
- https://mobalytics.gg/tft/set19/unlocks
