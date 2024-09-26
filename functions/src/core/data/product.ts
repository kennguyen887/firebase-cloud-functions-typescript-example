import { firestore } from "firebase-admin";
import Timestamp = firestore.Timestamp;
import FieldValue = firestore.FieldValue;

export enum ProductStatus {
  DRAFT = "draft",
  FOR_REVIEW = "for_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum ProductType {
  PHYSICAL = "physical",
  AI_SERVICE = "ai_service",
  SOURCE_CODE = "source_code",
  DIGIAL_ASSET = "digital_asset",
  CONSULTANT = "consultant",
  JOB = "job",
  ARTICLE = "article",
  EVENT = "event",
  E_VOUCHER = "e_voucher",
}

export class Product {
  constructor(
    public readonly productId: string | undefined,
    public readonly storeOwnerUid: string,
    public readonly name: string,
    public readonly price: number,
    public readonly content: string,
    public readonly type: ProductType,
    public readonly status: ProductStatus,

    public readonly stockQuantity: number,
    public readonly internalCode: string,
    public readonly createdAt: Date
  ) {}

  static empty() {
    return new Product(
      "",
      "",
      "",
      0,
      "",
      ProductType.PHYSICAL,
      ProductStatus.ACTIVE,
      0,
      "",
      new Date()
    );
  }
}
