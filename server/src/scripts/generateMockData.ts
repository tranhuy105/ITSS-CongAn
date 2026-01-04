import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Dish, { IDish } from '../models/Dish';
import Restaurant, { IRestaurant } from '../models/Restaurant';
import User from '../models/User';
import connectDatabase from '../utils/database';

dotenv.config();

const mockUsers = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin' as const,
    },
    {
        name: 'Admin Support',
        email: 'admin.support@example.com',
        password: 'admin123',
        role: 'admin' as const,
    },
    {
        name: 'Guest User',
        email: 'tranhuy105@example.com',
        password: 'tranhuy105',
        role: 'guest' as const,
    },
    {
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        password: 'user12345',
        role: 'guest' as const,
    },
    {
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        password: 'user12345',
        role: 'guest' as const,
    },
    {
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        password: 'user12345',
        role: 'guest' as const,
    },
    {
        name: 'Phạm Thị D (Locked)',
        email: 'phamthid@example.com',
        password: 'user12345',
        role: 'guest' as const,
        isLocked: true,
    },
    {
        name: 'Hoàng Văn E (Locked)',
        email: 'hoangvane@example.com',
        password: 'user12345',
        role: 'guest' as const,
        isLocked: true,
    },
];

// Comprehensive Vietnamese dishes from all regions
const dishTemplates = [
    // MIỀN BẮC (Northern Vietnam) - Phở
    {
        name: { ja: 'フォー・ボー', vi: 'Phở Bò' },
        description: {
            ja: '牛肉のフォー。ベトナムの代表的な麺料理で、香り高いスープと柔らかい牛肉が特徴です。',
            vi: 'Phở bò là món ăn truyền thống của Việt Nam với nước dùng thơm ngon và thịt bò mềm.',
        },
        ingredients: [
            { name: 'Bánh phở', quantity: '200g' },
            { name: 'Thịt bò', quantity: '150g' },
            { name: 'Nước dùng xương bò', quantity: '500ml' },
            { name: 'Hành tây', quantity: '1 củ' },
            { name: 'Gừng', quantity: '20g' },
            { name: 'Hoa hồi', quantity: '2 cái' },
            { name: 'Quế', quantity: '1 thanh' },
        ],
        category: 'Phở',
        region: 'Miền Bắc',
        cookingTime: 180,
        image: 'pho-bo.jpg',
    },
    {
        name: { ja: 'フォー・ガー', vi: 'Phở Gà' },
        description: {
            ja: '鶏肉のフォー。あっさりとした鶏ガラスープが特徴の優しい味わいです。',
            vi: 'Phở gà với nước dùng trong vắt từ xương gà, thịt gà mềm và thơm.',
        },
        ingredients: [
            { name: 'Bánh phở', quantity: '200g' },
            { name: 'Thịt gà', quantity: '150g' },
            { name: 'Nước dùng gà', quantity: '500ml' },
            { name: 'Hành tây', quantity: '1 củ' },
            { name: 'Gừng', quantity: '15g' },
        ],
        category: 'Phở',
        region: 'Miền Bắc',
        cookingTime: 120,
        image: 'pho-ga.jpg',
    },
    // MIỀN BẮC - Bún
    {
        name: { ja: 'ブンチャー', vi: 'Bún Chả' },
        description: {
            ja: 'つけ麺スタイルの料理。炭火焼きの豚肉を甘酸っぱいタレにつけて食べます。',
            vi: 'Bún chả là món ăn Hà Nội với thịt nướng và nước mắm chua ngọt đặc trưng.',
        },
        ingredients: [
            { name: 'Bún', quantity: '200g' },
            { name: 'Thịt nướng', quantity: '150g' },
            { name: 'Nước mắm', quantity: '50ml' },
            { name: 'Đường', quantity: '30g' },
            { name: 'Giấm', quantity: '20ml' },
            { name: 'Rau sống', quantity: '100g' },
        ],
        category: 'Bún',
        region: 'Miền Bắc',
        cookingTime: 60,
        image: 'bun-cha.jpg',
    },
    {
        name: { ja: 'ブンリュウ', vi: 'Bún Riêu' },
        description: {
            ja: 'カニ味噌入りトマトスープの麺料理。酸味と旨味のバランスが絶妙です。',
            vi: 'Bún riêu cua với nước dùng cà chua chua ngọt, riêu cua thơm béo.',
        },
        ingredients: [
            { name: 'Bún', quantity: '200g' },
            { name: 'Riêu cua', quantity: '100g' },
            { name: 'Cà chua', quantity: '3 quả' },
            { name: 'Đậu hũ', quantity: '100g' },
            { name: 'Mắm tôm', quantity: '20ml' },
        ],
        category: 'Bún',
        region: 'Miền Bắc',
        cookingTime: 90,
        image: 'bun-rieu.jpg',
    },
    // MIỀN BẮC - Bánh
    {
        name: { ja: 'バインクオン', vi: 'Bánh Cuốn' },
        description: {
            ja: '蒸し米粉のロール。薄い生地に豚肉ときのこを包んだ繊細な料理です。',
            vi: 'Bánh cuốn là món ăn sáng truyền thống với bánh mỏng, nhân thịt và mộc nhĩ.',
        },
        ingredients: [
            { name: 'Bột gạo', quantity: '200g' },
            { name: 'Thịt lợn băm', quantity: '100g' },
            { name: 'Mộc nhĩ', quantity: '50g' },
            { name: 'Hành khô', quantity: '30g' },
            { name: 'Nước mắm', quantity: '50ml' },
        ],
        category: 'Bánh',
        region: 'Miền Bắc',
        cookingTime: 45,
        image: 'banh-cuon.jpg',
    },
    {
        name: { ja: 'バインゴイ', vi: 'Bánh Gối' },
        description: {
            ja: '揚げ餃子のような料理。サクサクの皮と肉餡が特徴です。',
            vi: 'Bánh gối chiên giòn với nhân thịt, mộc nhĩ và trứng.',
        },
        ingredients: [
            { name: 'Bột mì', quantity: '200g' },
            { name: 'Thịt lợn băm', quantity: '150g' },
            { name: 'Mộc nhĩ', quantity: '50g' },
            { name: 'Trứng', quantity: '2 quả' },
            { name: 'Hành tây', quantity: '1 củ' },
        ],
        category: 'Bánh',
        region: 'Miền Bắc',
        cookingTime: 60,
        image: 'banh-goi.jpg',
    },
    // MIỀN TRUNG (Central Vietnam) - Bún
    {
        name: { ja: 'ブンボーフエ', vi: 'Bún Bò Huế' },
        description: {
            ja: 'フエ風牛肉麺。辛味とレモングラスの香りが特徴的な中部の代表料理です。',
            vi: 'Bún bò Huế là món ăn đặc sản xứ Huế với nước dùng cay nồng, thịt bò và chả.',
        },
        ingredients: [
            { name: 'Bún', quantity: '200g' },
            { name: 'Thịt bò', quantity: '150g' },
            { name: 'Chả lụa', quantity: '100g' },
            { name: 'Sả', quantity: '2 cây' },
            { name: 'Mắm ruốc', quantity: '30g' },
            { name: 'Ớt', quantity: '3 quả' },
        ],
        category: 'Bún',
        region: 'Miền Trung',
        cookingTime: 150,
        image: 'bun-bo-hue.jpg',
    },
    {
        name: { ja: 'ミークアン', vi: 'Mì Quảng' },
        description: {
            ja: 'クアンナム省の名物麺。黄色い平麺と少なめのスープが特徴です。',
            vi: 'Mì Quảng là món ăn đặc sản Quảng Nam với sợi mì vàng, nước dùng ít và đậu phộng rang.',
        },
        ingredients: [
            { name: 'Mì Quảng', quantity: '200g' },
            { name: 'Tôm', quantity: '100g' },
            { name: 'Thịt heo', quantity: '100g' },
            { name: 'Đậu phộng', quantity: '50g' },
            { name: 'Bánh tráng', quantity: '2 cái' },
            { name: 'Rau sống', quantity: '100g' },
        ],
        category: 'Bún',
        region: 'Miền Trung',
        cookingTime: 90,
        image: 'mi-quang.jpg',
    },
    // MIỀN TRUNG - Bánh
    {
        name: { ja: 'バインベオ', vi: 'Bánh Bèo' },
        description: {
            ja: '小さな蒸しケーキ。エビのフレークとネギ油をトッピングした一口サイズの料理です。',
            vi: 'Bánh bèo là món ăn nhỏ xinh với bánh mềm, tôm khô và mỡ hành thơm.',
        },
        ingredients: [
            { name: 'Bột gạo', quantity: '200g' },
            { name: 'Tôm khô', quantity: '50g' },
            { name: 'Mỡ hành', quantity: '30ml' },
            { name: 'Nước mắm', quantity: '50ml' },
        ],
        category: 'Bánh',
        region: 'Miền Trung',
        cookingTime: 40,
        image: 'banh-beo.jpg',
    },
    {
        name: { ja: 'バインコアイ', vi: 'Bánh Khoái' },
        description: {
            ja: 'フエ風お好み焼き。小さめのサイズで、エビと豚肉が入っています。',
            vi: 'Bánh khoái là món ăn Huế với bánh giòn, nhân tôm thịt và rau sống.',
        },
        ingredients: [
            { name: 'Bột gạo', quantity: '150g' },
            { name: 'Tôm', quantity: '100g' },
            { name: 'Thịt heo', quantity: '100g' },
            { name: 'Giá đỗ', quantity: '50g' },
            { name: 'Trứng', quantity: '2 quả' },
        ],
        category: 'Bánh',
        region: 'Miền Trung',
        cookingTime: 30,
        image: 'banh-khoai.jpg',
    },
    // MIỀN TRUNG - Cơm
    {
        name: { ja: 'コムヘン', vi: 'Cơm Hến' },
        description: {
            ja: 'シジミご飯。フエの名物で、シジミの旨味が染み込んだご飯です。',
            vi: 'Cơm hến là món ăn đặc sản Huế với cơm, hến xào và rau thơm.',
        },
        ingredients: [
            { name: 'Cơm', quantity: '200g' },
            { name: 'Hến', quantity: '200g' },
            { name: 'Đậu phộng', quantity: '50g' },
            { name: 'Rau thơm', quantity: '100g' },
            { name: 'Mắm ruốc', quantity: '30g' },
        ],
        category: 'Cơm',
        region: 'Miền Trung',
        cookingTime: 45,
        image: 'com-hen.jpg',
    },
    // MIỀN NAM (Southern Vietnam) - Cơm
    {
        name: { ja: 'コムタム', vi: 'Cơm Tấm' },
        description: {
            ja: '砕き米のご飯。豚肉のグリルや目玉焼きと一緒に食べる南部の人気料理です。',
            vi: 'Cơm tấm là món ăn đặc trưng miền Nam với cơm gạo tấm và sườn nướng thơm ngon.',
        },
        ingredients: [
            { name: 'Gạo tấm', quantity: '200g' },
            { name: 'Sườn nướng', quantity: '150g' },
            { name: 'Trứng', quantity: '1 quả' },
            { name: 'Bì', quantity: '50g' },
            { name: 'Nước mắm', quantity: '50ml' },
        ],
        category: 'Cơm',
        region: 'Miền Nam',
        cookingTime: 45,
        image: 'com-tam.jpg',
    },
    // MIỀN NAM - Bánh
    {
        name: { ja: 'バインミー', vi: 'Bánh Mì' },
        description: {
            ja: 'ベトナム風サンドイッチ。フランスパンに様々な具材を挟んだストリートフードの定番です。',
            vi: 'Bánh mì là món ăn đường phố phổ biến với bánh mì giòn và nhân thịt đa dạng.',
        },
        ingredients: [
            { name: 'Bánh mì', quantity: '1 ổ' },
            { name: 'Pate', quantity: '50g' },
            { name: 'Thịt nguội', quantity: '100g' },
            { name: 'Dưa leo', quantity: '50g' },
            { name: 'Rau mùi', quantity: '20g' },
        ],
        category: 'Bánh',
        region: 'Miền Nam',
        cookingTime: 15,
        image: 'banh-mi.jpg',
    },
    {
        name: { ja: 'バインセオ', vi: 'Bánh Xèo' },
        description: {
            ja: 'ベトナム風お好み焼き。パリパリの黄色い生地にエビと豚肉が入っています。',
            vi: 'Bánh xèo là món ăn miền Nam với bánh giòn vàng, nhân tôm thịt và giá đỗ.',
        },
        ingredients: [
            { name: 'Bột gạo', quantity: '200g' },
            { name: 'Bột nghệ', quantity: '5g' },
            { name: 'Tôm', quantity: '150g' },
            { name: 'Thịt ba chỉ', quantity: '100g' },
            { name: 'Giá đỗ', quantity: '100g' },
        ],
        category: 'Bánh',
        region: 'Miền Nam',
        cookingTime: 40,
        image: 'banh-xeo.jpg',
    },
    // MIỀN NAM - Gỏi
    {
        name: { ja: 'ゴイクン', vi: 'Gỏi Cuốn' },
        description: {
            ja: '生春巻き。ライスペーパーで野菜やエビを巻いた健康的な前菜です。',
            vi: 'Gỏi cuốn là món khai vị tươi mát với bánh tráng cuốn rau và tôm.',
        },
        ingredients: [
            { name: 'Bánh tráng', quantity: '8 cái' },
            { name: 'Tôm', quantity: '8 con' },
            { name: 'Thịt ba chỉ', quantity: '100g' },
            { name: 'Bún', quantity: '100g' },
            { name: 'Rau sống', quantity: '100g' },
        ],
        category: 'Gỏi',
        region: 'Miền Nam',
        cookingTime: 30,
        image: 'goi-cuon.jpg',
    },
    {
        name: { ja: 'ゴイガー', vi: 'Gỏi Gà' },
        description: {
            ja: '鶏肉のサラダ。千切りキャベツと鶏肉を和えたさっぱりとした料理です。',
            vi: 'Gỏi gà là món salad với thịt gà xé, bắp cải và rau răm.',
        },
        ingredients: [
            { name: 'Thịt gà', quantity: '200g' },
            { name: 'Bắp cải', quantity: '150g' },
            { name: 'Rau răm', quantity: '50g' },
            { name: 'Hành tây', quantity: '1 củ' },
            { name: 'Đậu phộng', quantity: '50g' },
        ],
        category: 'Gỏi',
        region: 'Miền Nam',
        cookingTime: 25,
        image: 'goi-ga.jpg',
    },
    // MIỀN NAM - Lẩu
    {
        name: { ja: 'ラウマム', vi: 'Lẩu Mắm' },
        description: {
            ja: '発酵魚の鍋。南部メコンデルタの名物で、独特の風味が特徴です。',
            vi: 'Lẩu mắm là món ăn đặc sản miền Tây với nước lẩu mắm đậm đà, cá và rau.',
        },
        ingredients: [
            { name: 'Mắm', quantity: '100ml' },
            { name: 'Cá lóc', quantity: '300g' },
            { name: 'Tôm', quantity: '200g' },
            { name: 'Rau muống', quantity: '100g' },
            { name: 'Bông so đũa', quantity: '100g' },
        ],
        category: 'Lẩu',
        region: 'Miền Nam',
        cookingTime: 60,
        image: 'lau-mam.jpg',
    },
    {
        name: { ja: 'ラウタイ', vi: 'Lẩu Thái' },
        description: {
            ja: 'タイ風鍋。酸味と辛味のバランスが良い人気の鍋料理です。',
            vi: 'Lẩu Thái với nước dùng chua cay, hải sản tươi ngon.',
        },
        ingredients: [
            { name: 'Tôm', quantity: '200g' },
            { name: 'Mực', quantity: '200g' },
            { name: 'Nấm', quantity: '150g' },
            { name: 'Sả', quantity: '3 cây' },
            { name: 'Ớt', quantity: '5 quả' },
        ],
        category: 'Lẩu',
        region: 'Miền Nam',
        cookingTime: 45,
        image: 'lau-thai.jpg',
    },
    // Chè (Desserts) - All regions
    {
        name: { ja: 'チェーバーマウ', vi: 'Chè Ba Màu' },
        description: {
            ja: '三色チェー。豆、ゼリー、ココナッツミルクの三層デザートです。',
            vi: 'Chè ba màu là món tráng miệng với đậu xanh, đậu đỏ và thạch.',
        },
        ingredients: [
            { name: 'Đậu xanh', quantity: '100g' },
            { name: 'Đậu đỏ', quantity: '100g' },
            { name: 'Thạch', quantity: '100g' },
            { name: 'Nước cốt dừa', quantity: '200ml' },
            { name: 'Đường', quantity: '100g' },
        ],
        category: 'Chè',
        region: 'Miền Nam',
        cookingTime: 60,
        image: 'che-ba-mau.jpg',
    },
    {
        name: { ja: 'チェーブオイ', vi: 'Chè Bưởi' },
        description: {
            ja: 'ザボンのチェー。ザボンの果肉とココナッツミルクの甘いデザートです。',
            vi: 'Chè bưởi là món tráng miệng với múi bưởi, nước cốt dừa ngọt mát.',
        },
        ingredients: [
            { name: 'Bưởi', quantity: '200g' },
            { name: 'Nước cốt dừa', quantity: '200ml' },
            { name: 'Đường', quantity: '80g' },
            { name: 'Bột năng', quantity: '50g' },
        ],
        category: 'Chè',
        region: 'Miền Nam',
        cookingTime: 45,
        image: 'che-buoi.jpg',
    },
    {
        name: { ja: 'チェースオイ', vi: 'Chè Sương Sáo' },
        description: {
            ja: '仙草ゼリーのチェー。黒いゼリーとシロップの爽やかなデザートです。',
            vi: 'Chè sương sáo là món tráng miệng mát lạnh với thạch đen và nước đường.',
        },
        ingredients: [
            { name: 'Sương sáo', quantity: '200g' },
            { name: 'Nước đường', quantity: '200ml' },
            { name: 'Nước cốt dừa', quantity: '100ml' },
        ],
        category: 'Chè',
        region: 'Miền Bắc',
        cookingTime: 30,
        image: 'che-suong-sao.jpg',
    },
    // Additional popular dishes
    {
        name: { ja: 'フーティウ', vi: 'Hủ Tiếu' },
        description: {
            ja: '南部の麺料理。透明なスープと米麺、豚肉やエビが入っています。',
            vi: 'Hủ tiếu là món ăn miền Nam với nước dùng trong, sợi hủ tiếu và tôm thịt.',
        },
        ingredients: [
            { name: 'Hủ tiếu', quantity: '200g' },
            { name: 'Tôm', quantity: '100g' },
            { name: 'Thịt heo', quantity: '100g' },
            { name: 'Giá đỗ', quantity: '50g' },
            { name: 'Hành lá', quantity: '20g' },
        ],
        category: 'Bún',
        region: 'Miền Nam',
        cookingTime: 90,
        image: 'hu-tieu.jpg',
    },
    {
        name: { ja: 'カオラウ', vi: 'Cao Lầu' },
        description: {
            ja: 'ホイアンの名物麺。太めの麺と豚肉、野菜を和えた料理です。',
            vi: 'Cao lầu là món ăn đặc sản Hội An với sợi mì dày, thịt heo và rau sống.',
        },
        ingredients: [
            { name: 'Mì cao lầu', quantity: '200g' },
            { name: 'Thịt heo xá xíu', quantity: '150g' },
            { name: 'Giá đỗ', quantity: '50g' },
            { name: 'Bánh đa', quantity: '3 cái' },
            { name: 'Rau thơm', quantity: '50g' },
        ],
        category: 'Bún',
        region: 'Miền Trung',
        cookingTime: 60,
        image: 'cao-lau.jpg',
    },
    {
        name: { ja: 'バインボットロック', vi: 'Bánh Bột Lọc' },
        description: {
            ja: 'タピオカ粉の餃子。透明な皮にエビと豚肉が入った中部の名物です。',
            vi: 'Bánh bột lọc là món ăn Huế với vỏ trong suốt, nhân tôm thịt.',
        },
        ingredients: [
            { name: 'Bột năng', quantity: '200g' },
            { name: 'Tôm', quantity: '150g' },
            { name: 'Thịt heo', quantity: '100g' },
            { name: 'Nước mắm', quantity: '50ml' },
        ],
        category: 'Bánh',
        region: 'Miền Trung',
        cookingTime: 50,
        image: 'banh-bot-loc.jpg',
    },
];

// Vietnamese cities with coordinates
const vietnameseCities = [
    // Miền Bắc
    { name: 'Hà Nội', lat: 21.0285, lng: 105.8542, region: 'Miền Bắc' },
    { name: 'Hải Phòng', lat: 20.8449, lng: 106.6881, region: 'Miền Bắc' },
    { name: 'Hạ Long', lat: 20.9599, lng: 107.0426, region: 'Miền Bắc' },
    { name: 'Nam Định', lat: 20.4388, lng: 106.1621, region: 'Miền Bắc' },
    { name: 'Thái Bình', lat: 20.4463, lng: 106.3365, region: 'Miền Bắc' },
    // Miền Trung
    { name: 'Huế', lat: 16.4637, lng: 107.5909, region: 'Miền Trung' },
    { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, region: 'Miền Trung' },
    { name: 'Hội An', lat: 15.8801, lng: 108.3380, region: 'Miền Trung' },
    { name: 'Quy Nhơn', lat: 13.7830, lng: 109.2196, region: 'Miền Trung' },
    { name: 'Nha Trang', lat: 12.2388, lng: 109.1967, region: 'Miền Trung' },
    // Miền Nam
    { name: 'Hồ Chí Minh', lat: 10.7769, lng: 106.7008, region: 'Miền Nam' },
    { name: 'Cần Thơ', lat: 10.0452, lng: 105.7469, region: 'Miền Nam' },
    { name: 'Vũng Tàu', lat: 10.3460, lng: 107.0843, region: 'Miền Nam' },
    { name: 'Đà Lạt', lat: 11.9404, lng: 108.4583, region: 'Miền Nam' },
    { name: 'Phan Thiết', lat: 10.9280, lng: 108.1020, region: 'Miền Nam' },
    { name: 'Long Xuyên', lat: 10.3861, lng: 105.4350, region: 'Miền Nam' },
    { name: 'Mỹ Tho', lat: 10.3600, lng: 106.3600, region: 'Miền Nam' },
];

// Restaurant name templates by region
const restaurantNamesByRegion: Record<string, string[]> = {
    'Miền Bắc': [
        'Phở Hà Nội', 'Bún Chả Hương', 'Phở Thin', 'Bánh Cuốn Hà Nội',
        'Quán Ăn Bắc', 'Nhà Hàng Thủ Đô', 'Phở Bát Đàn', 'Bún Riêu Cô Giang',
        'Chả Cá Lã Vọng', 'Phở Gia Truyền', 'Bún Đậu Mắm Tôm', 'Bánh Gối Hà Nội',
    ],
    'Miền Trung': [
        'Bún Bò Huế', 'Mì Quảng Bà Mua', 'Cao Lầu Hội An', 'Bánh Bèo Huế',
        'Quán Ăn Cố Đô', 'Nhà Hàng Hoàng Cung', 'Bánh Khoái Huế', 'Cơm Hến Huế',
        'Mì Quảng Quảng Nam', 'Bánh Bột Lọc Huế', 'Bún Thịt Nướng Đà Nẵng',
    ],
    'Miền Nam': [
        'Cơm Tấm Mộc', 'Bánh Mì Saigon', 'Hủ Tiếu Nam Vang', 'Bánh Xèo Miền Tây',
        'Quán Ăn Sài Gòn', 'Nhà Hàng Miền Nam', 'Lẩu Mắm Cần Thơ', 'Gỏi Cuốn Sài Gòn',
        'Cơm Niêu Singapore', 'Bánh Mì Huỳnh Hoa', 'Hủ Tiếu Mỹ Tho', 'Lẩu Thái Sài Gòn',
    ],
};

const streetsByRegion: Record<string, string[]> = {
    'Miền Bắc': [
        'Hàng Bông', 'Hàng Gai', 'Hàng Bạc', 'Hàng Đào', 'Tràng Tiền',
        'Lý Thường Kiệt', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Lê Duẩn', 'Nguyễn Thái Học',
    ],
    'Miền Trung': [
        'Lê Lợi', 'Trần Phú', 'Nguyễn Huệ', 'Bạch Đằng', 'Hùng Vương',
        'Phan Bội Châu', 'Lý Thường Kiệt', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Nguyễn Tri Phương',
    ],
    'Miền Nam': [
        'Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Lý Thường Kiệt',
        'Pasteur', 'Đồng Khởi', 'Nam Kỳ Khởi Nghĩa', 'Võ Văn Tần', 'Cách Mạng Tháng Tám',
    ],
};

// Generate random location around a city
const generateLocationNearCity = (city: typeof vietnameseCities[0]) => {
    const radius = 0.05; // ~5km radius
    return {
        type: 'Point' as const,
        coordinates: [
            city.lng + (Math.random() - 0.5) * radius,
            city.lat + (Math.random() - 0.5) * radius,
        ],
    };
};

// Get random items from array
const getRandomItems = <T>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

async function generateMockData() {
    try {
        console.log('Starting mock data generation...\n');
        console.log('Connecting to database...');
        await connectDatabase();

        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Dish.deleteMany({});
        await Restaurant.deleteMany({});

        console.log('Database cleared\n');

        // Create users
        console.log('Creating users...');
        const users = await User.create(mockUsers);
        console.log(`Created ${users.length} users\n`);

        // Create dishes with variations
        console.log('Creating dishes...');
        const dishes = [];

        for (const template of dishTemplates) {
            // Create 2-4 variations of each dish
            const variations = Math.floor(Math.random() * 3) + 2;

            for (let i = 0; i < variations; i++) {
                const suffix = i > 0 ? ` (Phiên bản ${i + 1})` : '';
                // Generate price range based on category
                // Prices in VND (Vietnamese Dong)
                let baseMinPrice = 30000; // 30k VND
                let baseMaxPrice = 150000; // 150k VND

                // Adjust prices based on category
                if (template.category === 'Phở' || template.category === 'Bún') {
                    baseMinPrice = 40000;
                    baseMaxPrice = 120000;
                } else if (template.category === 'Bánh') {
                    baseMinPrice = 20000;
                    baseMaxPrice = 80000;
                } else if (template.category === 'Cơm') {
                    baseMinPrice = 50000;
                    baseMaxPrice = 150000;
                } else if (template.category === 'Lẩu') {
                    baseMinPrice = 200000;
                    baseMaxPrice = 500000;
                } else if (template.category === 'Chè') {
                    baseMinPrice = 15000;
                    baseMaxPrice = 50000;
                } else if (template.category === 'Gỏi') {
                    baseMinPrice = 60000;
                    baseMaxPrice = 200000;
                }

                // Add some variation
                const minPrice = Math.floor(baseMinPrice + Math.random() * (baseMaxPrice - baseMinPrice) * 0.3);
                const maxPrice = Math.floor(minPrice + (baseMaxPrice - minPrice) * (0.5 + Math.random() * 0.5));

                // Tạo tên file ảnh riêng cho mỗi phiên bản
                // Ví dụ: pho-bo.jpg -> pho-bo-1.jpg, pho-bo-2.jpg, pho-bo-3.jpg
                let imageFileName = '';
                if (template.image) {
                    const baseName = template.image.replace('.jpg', '').replace('.png', '').replace('.webp', '');
                    const extension = template.image.split('.').pop() || 'jpg';
                    imageFileName = `${baseName}-${i + 1}.${extension}`;
                }

                dishes.push({
                    ...template,
                    name: {
                        ja: `${template.name.ja}${suffix}`,
                        vi: `${template.name.vi}${suffix}`,
                    },
                    // Mỗi phiên bản có ảnh riêng: pho-bo-1.jpg, pho-bo-2.jpg, etc.
                    images: imageFileName ? [`/uploads/dishes/${imageFileName}`] : [],
                    averageRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
                    reviewCount: Math.floor(Math.random() * 500) + 50,
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                    createdBy: users[0]._id,
                });
            }
        }

        const createdDishes = await Dish.create(dishes);
        console.log(`✅ Created ${createdDishes.length} dishes\n`);
        // Group dishes by region
        const dishesByRegion: Record<string, IDish[]> = {
            'Miền Bắc': createdDishes.filter((d: IDish) => d.region === 'Miền Bắc'),
            'Miền Trung': createdDishes.filter((d: IDish) => d.region === 'Miền Trung'),
            'Miền Nam': createdDishes.filter((d: IDish) => d.region === 'Miền Nam'),
        };

        // Create restaurants
        console.log('Creating restaurants...');
        const restaurants = [];

        // Create 8-12 restaurants per city
        for (const city of vietnameseCities) {
            const restaurantCount = Math.floor(Math.random() * 5) + 8;
            const regionDishes = dishesByRegion[city.region];
            const restaurantNames = restaurantNamesByRegion[city.region];
            const streets = streetsByRegion[city.region];

            for (let i = 0; i < restaurantCount; i++) {
                const restaurantName = restaurantNames[i % restaurantNames.length];
                const suffix = i >= restaurantNames.length ? ` Chi nhánh ${Math.floor(i / restaurantNames.length) + 1}` : '';
                const street = streets[Math.floor(Math.random() * streets.length)];
                const number = Math.floor(Math.random() * 900) + 100;

                // Assign 3-8 dishes from the same region
                const dishCount = Math.floor(Math.random() * 6) + 3;
                const selectedDishes = getRandomItems(regionDishes, Math.min(dishCount, regionDishes.length));

                // Tạo tên file ảnh dựa trên tên nhà hàng
                // Ví dụ: "Phở Hà Nội" -> "nha_hang_pho_ha_noi"
                const imageBaseName = restaurantName
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
                    .replace(/đ/g, 'd')
                    .replace(/Đ/g, 'D')
                    .replace(/\s+/g, '_'); // Thay space bằng underscore

                // Thêm số thứ tự để phân biệt các chi nhánh
                const branchNumber = Math.floor(i / restaurantNames.length) + 1;
                const imageFileName = branchNumber > 1
                    ? `nha_hang_${imageBaseName}_${branchNumber}.jpg`
                    : `nha_hang_${imageBaseName}.jpg`;

                restaurants.push({
                    name: `${restaurantName}${suffix}`,
                    address: `${number} ${street}, ${city.name}`,
                    location: generateLocationNearCity(city),
                    phone: `+84 ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
                    website: `https://${restaurantName.toLowerCase().replace(/\s+/g, '')}.vn`,
                    images: [`/uploads/restaurants/${imageFileName}`],
                    dishes: selectedDishes.map((d: IDish) => d._id),
                    averageRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
                    reviewCount: Math.floor(Math.random() * 600) + 100,
                });
            }
        }

        const createdRestaurants = await Restaurant.create(restaurants);
        console.log(`Created ${createdRestaurants.length} restaurants\n`);
        // Print summary
        console.log('═══════════════════════════════════════════════════════');
        console.log('Mock data generated successfully!');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log('Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Dishes: ${createdDishes.length}`);
        console.log(`   Restaurants: ${createdRestaurants.length}\n`);

        console.log('Restaurants by region:');
        const restaurantsByRegion = {
            'Miền Bắc': createdRestaurants.filter((r: IRestaurant) =>
                vietnameseCities.find(c => r.address.includes(c.name))?.region === 'Miền Bắc'
            ).length,
            'Miền Trung': createdRestaurants.filter((r: IRestaurant) =>
                vietnameseCities.find(c => r.address.includes(c.name))?.region === 'Miền Trung'
            ).length,
            'Miền Nam': createdRestaurants.filter((r: IRestaurant) =>
                vietnameseCities.find(c => r.address.includes(c.name))?.region === 'Miền Nam'
            ).length,
        };
        console.log(`   Miền Bắc: ${restaurantsByRegion['Miền Bắc']} restaurants`);
        console.log(`   Miền Trung: ${restaurantsByRegion['Miền Trung']} restaurants`);
        console.log(`   Miền Nam: ${restaurantsByRegion['Miền Nam']} restaurants\n`);

        console.log('Dishes by category:');
        const dishesByCategory = createdDishes.reduce((acc: Record<string, number>, dish: IDish) => {
            acc[dish.category] = (acc[dish.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        Object.entries(dishesByCategory).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} dishes`);
        });

        console.log('\nTest Credentials:');
        console.log('   Admin:');
        console.log('     Email: admin@example.com');
        console.log('     Password: admin123');
        console.log('   Guest:');
        console.log('     Email: tranhuy105@example.com');
        console.log('     Password: tranhuy105');

        console.log('\n═══════════════════════════════════════════════════════\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error generating mock data:', error);
        process.exit(1);
    }
}

generateMockData();
