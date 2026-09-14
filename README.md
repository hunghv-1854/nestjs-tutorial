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

- [ ] Authenticate qua JWT (signup/login, logout)
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

- API: http://localhost:3000
- Swagger docs: http://localhost:3000/api

### i18n

Ngôn ngữ trả về được resolve theo thứ tự: query `?lang=vi`, header `Accept-Language`, mặc định `en`.

```bash
$ curl "http://localhost:3000/?lang=vi"
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
