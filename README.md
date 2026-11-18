# TFT Handbook – Source Code (Refactored)

Đây là **bản phát triển riêng**, chưa thay đổi repository hoặc Vercel của bạn. Website vẫn dùng HTML/CSS/JavaScript thuần, không cần React và không cần Node.js.

## Cấu trúc

```text
TFT-Handbook-Refactored/
├── index.html                  # Bản web được tạo tự động, đầy đủ ảnh, xem offline
├── build.py                    # Ghép source thành index.html
├── src/
│   ├── template.html           # Khung HTML: tab, nút, popup
│   ├── styles/
│   │   ├── base.css            # Layout, màu sắc, ô tướng
│   │   ├── traits.css          # Giao diện tộc/hệ
│   │   └── unlocks.css         # Popup mở khóa (nếu tách riêng)
│   ├── js/
│   │   ├── core.js             # Dữ liệu, trạng thái và helpers
│   │   ├── units-and-filters.js # Thẻ tướng, bộ lọc, popup kỹ năng
│   │   ├── unlocks.js          # Sơ đồ mở khóa
│   │   ├── traits.js           # Tab tộc/hệ, icon
│   │   └── save.js             # Xuất bản HTML có tùy chỉnh
│   ├── data/
│   │   ├── champions.json      # 94 tướng: giá, vai trò, tộc/hệ, hiệu ứng
│   │   ├── skills.json         # 94 kỹ năng tóm tắt
│   │   ├── unlocks.json        # 32 điều kiện mở khóa
│   │   ├── traits.json         # 47 mô tả tộc/hệ
│   │   ├── effects.json        # Từ điển hiệu ứng
│   │   ├── champion-images.json # Bảng ánh xạ tướng => file ảnh
│   │   └── trait-icons.json    # Bảng ánh xạ hệ => icon
│   └── assets/
│       ├── champions/          # 94 hình tướng
│       └── traits/             # 47 icon tộc/hệ
```

## Chạy thử

**Cách đơn giản nhất:** mở `index.html` bằng Chrome hoặc Edge. Nó đã được tạo sẵn và vẫn sử dụng offline.

**Khi sửa dữ liệu/code:**

1. Mở thư mục này trong VS Code.
2. Ví dụ: tìm Tibbers trong `src/data/unlocks.json`, sửa mô tả nếu cần. Để sửa giao diện sơ đồ, xem `src/js/unlocks.js` và `src/styles/unlocks.css`.
3. Mở terminal trong thư mục và chạy:

   ```bash
   python build.py
   ```

   Nếu Windows chỉ có Python Launcher, dùng `py build.py`.
4. Mở lại `index.html` và kiểm tra thay đổi.

**Đừng sửa trực tiếp `index.html`**: nó được sinh từ thư mục `src/`, lần build sau sẽ ghi đè.

## GitHub / Vercel – không đụng bản đang chạy

1. Giữ nguyên `main` để website Vercel Production tiếp tục hoạt động.
2. Tạo nhánh `dev` trên GitHub từ `main`. Không đưa code mới lên `main` trong lúc thử nghiệm.
3. Khi muốn đưa bản refactor lên nhánh `dev`, bạn có thể dùng GitHub Desktop: checkout nhánh `dev`, chép **nội dung** thư mục refactor này vào thư mục repo (thay `index.html` và thêm `src/`, `build.py`), rồi commit/push.
4. Test bản `dev`, sau đó tạo Pull Request `dev -> main` chỉ khi sẵn sàng công bố.

Lưu ý: Vercel có thể tạo một **Preview Deployment** cho nhánh `dev`; bản Production vẫn giữ nguyên cho đến khi merge vào production branch. Đừng dùng `vercel --prod` trong quá trình thử nghiệm.

## Nguồn dữ liệu tham khảo

- https://tft.ninja/sets/19/units
- https://tactics.tools/info/set-update
- https://mobalytics.gg/tft/set19/unlocks

Mùa 19 có thể có điều chỉnh sau PBE; dữ liệu trong file là snapshot từ lần cập nhật trước.

## Bản này

Đã bỏ toàn bộ mục gợi ý trang bị và bộ lọc Shojin/Bùa Xanh/Cuồng Đao. Các điều kiện mở khóa liên quan đến số trang bị vẫn được giữ nguyên vì đó là cơ chế mở khóa tướng.
