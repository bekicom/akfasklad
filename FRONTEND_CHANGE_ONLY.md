# Frontend Change Only

Bu hujjat faqat kechagi cashback bilan bugungi cashback orasidagi farq uchun.

Frontend hammasini qayta yozishi shart emas.

## Asosiy farq

Kecha:

```text
Cashback faqat yig'ilardi
Cashback alohida payout qilinardi
```

Bugun:

```text
Cashback yig'iladi
Cashbackni sale ichida ishlatib yana product sotish mumkin
```

## O'zgarmagan joylar

Quyidagilar oldingidek ishlaydi:

```text
POST /api/auth/login
POST /api/products/create
POST /api/customers/register
POST /api/customers/login
GET  /api/customers/:id/cashback
GET  /api/customers/me/cashback
GET  /api/cashback/report
POST /api/customers/:id/cashback/payout
```

Demak:

```text
Admin cashback ko'rish o'zgarmagan
Mobile cashback ko'rish o'zgarmagan
Cashback report o'zgarmagan
Productga cashback biriktirish o'zgarmagan
```

## Yangi qo'shilgan joy

Faqat bitta yangi imkoniyat qo'shildi:

```text
POST /api/sales/create
```

Bu endpoint endi optional field qabul qiladi:

```json
{
  "cashbackToUse": {
    "UZS": 20000
  }
}
```

## Muhim gap

Agar frontend `cashbackToUse` yubormasa:

```text
Eski logika ishlaydi
```

Ya'ni:

```text
Sale oddiy bo'ladi
Cashback faqat yig'iladi
```

Shuning uchun eski frontend sinmaydi.

## Frontend nima qo'shishi kerak

Sale oynasida:

```text
Customer cashback balansini ko'rsatish
Qancha cashback ishlatishini input qilish
```

So'ng `sales/create` ga shu fieldni yuborish:

```json
{
  "customerId": "CUSTOMER_ID",
  "items": [
    {
      "productId": "PRODUCT_ID",
      "qty": 1,
      "sell_price": 100000
    }
  ],
  "cashbackToUse": {
    "UZS": 20000
  }
}
```

## Backend response dagi yangi foydali fieldlar

Endi sale response ichida quyidagilar bo'ladi:

```json
{
  "totals": {
    "grandTotal": 100000,
    "cashbackUsed": 20000,
    "payableTotal": 80000
  }
}
```

Ma'nosi:

```text
grandTotal = productning umumiy summasi
cashbackUsed = ishlatilgan cashback
payableTotal = qolgan to'lanadigan summa
```

## Frontend uchun eng qisqa xulosa

```text
Eski cashback API lar o'zgarmadi.
Faqat /api/sales/create ga cashbackToUse degan yangi optional field qo'shildi.
Yuborilmasa eski logika ishlaydi.
Yuborilsa cashback bilan yana product sotish ishlaydi.
```
