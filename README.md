<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">Project học NestJS — clone RealWorld (Medium clone) backend API.</p>

## Mô tả

Đây là bài tutorial thực hành NestJS, mục tiêu xây dựng backend API clone lại [RealWorld](https://realworld-docs.netlify.app) (một ứng dụng kiểu Medium), tập trung hoàn toàn vào Backend, không làm giao diện frontend.

**Kiến thức trọng tâm luyện tập:**

- Kiến trúc Modular, `@Module()`
- Routes/controllers với `@Get()/@Post()/@Patch()/@Delete()`
- Kết nối database với TypeORM (PostgreSQL hoặc MySQL)
- Authentication bằng JWT
- Exception handling & middlewares (Pipes, Filters)
- i18n — đa ngôn ngữ
- Swagger — tài liệu API tự sinh

## Tính năng (spec)

Theo spec [RealWorld](https://realworld-docs.netlify.app/implementation-creation/features/), khuyến khích hoàn thành 5 ý đầu, 2 ý cuối tùy tiến độ:

- [x] Authenticate qua JWT (signup/login, logout)
- [ ] CRU- users (đăng ký & settings — không cần xóa)
- [ ] CRUD Articles
- [ ] CR-D Comments trên article (không cần update)
- [ ] GET danh sách articles có phân trang
- [ ] (tùy chọn) Favorite articles
- [ ] (tùy chọn) Follow users khác

## Cài đặt

```bash
$ npm install
```

Copy file env mẫu và chỉnh nếu cần:

```bash
$ cp .env.example .env
```

Chạy PostgreSQL và Redis bằng Docker Compose:

```bash
$ docker compose up -d
# hoặc, nếu máy chỉ có docker-compose bản standalone:
$ docker-compose up -d
```

Chạy migration để tạo schema database (dự án dùng migration thủ công, không dùng `synchronize`):

```bash
$ npm run migration:run
```

## Chạy project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

Sau khi chạy, truy cập:

- API: http://localhost:3000/api (theo spec RealWorld, các route đều có prefix `/api`; riêng route hello world `/` không có prefix)
- Swagger docs: http://localhost:3000/docs

### i18n

Ngôn ngữ trả về được resolve theo thứ tự: query `?lang=vi`, header `Accept-Language`, mặc định `en`.

```bash
$ curl "http://localhost:3000/?lang=vi"
```

### Authentication

Đăng ký, đăng nhập, đăng xuất và lấy thông tin user hiện tại. Token JWT gửi qua header `Authorization: Token <jwt>`. Khi logout, token bị đưa vào blacklist trong Redis (theo TTL còn lại) nên không thể dùng lại dù chưa hết hạn.

| Method | Endpoint           | Mô tả                       | Cần token |
| ------ | ------------------ | --------------------------- | --------- |
| POST   | `/api/users`       | Đăng ký                     | Không     |
| POST   | `/api/users/login` | Đăng nhập                   | Không     |
| GET    | `/api/user`        | Lấy thông tin user hiện tại | Có        |
| POST   | `/api/user/logout` | Đăng xuất (blacklist token) | Có        |

```bash
$ curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"user":{"username":"hung","email":"hung@example.com","password":"password123"}}'
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Database migration

Dự án dùng migration TypeORM thủ công (`synchronize: false`), không tự đồng bộ schema từ entity.

```bash
# tạo migration mới, rỗng
$ npm run migration:create -- src/database/migrations/<Name>

# sinh migration từ diff giữa entity và database hiện tại
$ npm run migration:generate -- src/database/migrations/<Name>

# áp dụng các migration chưa chạy
$ npm run migration:run

# revert migration gần nhất
$ npm run migration:revert
```

## Lint & format

```bash
$ npm run lint
$ npm run format
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [nestjs-i18n Documentation](https://nestjs-i18n.com/)
- [Swagger (OpenAPI) trong NestJS](https://docs.nestjs.com/openapi/introduction)
- [RealWorld — Introduction](https://realworld-docs.netlify.app)
- [RealWorld — API spec khuyến nghị](https://realworld-docs.netlify.app/specifications/backend/endpoints/)
- [Wireframe (Figma)](https://www.figma.com/design/bQ02ebnAIsjwg1kTimNSPS/Medium-clone--Copy-?node-id=26-58)
