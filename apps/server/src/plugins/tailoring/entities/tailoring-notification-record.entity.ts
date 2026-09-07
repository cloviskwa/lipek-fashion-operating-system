import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * One customer/staff notification for a tailoring job (`R-06`, SOT §9A's
 * "optionally notify the customer").
 *
 * Per ADR-0014 §5.5 only the handover stages notify — this record is created
 * by the production service when such a transition happens, in `QUEUED`
 * state. Actual delivery (email/SMS) is the integrations plugin's job
 * (ADR-0002); until a provider lands, `provider` stays at the schema's own
 * `provider-pending` default, which is what makes the record honest: it
 * claims a notification is *due*, not that one was sent.
 */
@Entity()
export class TailoringNotificationRecord extends VendureEntity {
    constructor(input?: DeepPartial<TailoringNotificationRecord>) {
        super(input);
    }

    /** Who the notification is for: `customer` or `staff`. */
    @Column()
    audience: string;

    /** What kind, e.g. `stage_advanced`, `fitting_scheduled`. */
    @Column()
    eventType: string;

    @Column()
    fromStage: string;

    @Column()
    toStage: string;

    /** `QUEUED` (schema default) → `SENT` | `FAILED` by the delivery side. */
    @Column({ default: 'QUEUED' })
    status: string;

    /** The delivery channel used; the schema defaults to `provider-pending`. */
    @Column({ default: 'provider-pending' })
    provider: string;

    @Column({ type: 'timestamp', nullable: true })
    sentAt: Date | null;

    /** JSON rendered at enqueue time (job number, stage labels, deep link). */
    @Column({ type: 'text', nullable: true })
    payload: string | null;

    @Index('IDX_tailoring_notification_job')
    @Column({ type: 'int' })
    tailoringJobId: number;

    /** Recipient when `audience` is `customer` (plain column — no FK). */
    @Index('IDX_tailoring_notification_customer')
    @Column({ type: 'int', nullable: true })
    recipientCustomerId: number | null;

    /** Recipient when `audience` is `staff` (Administrator id). */
    @Index('IDX_tailoring_notification_staff')
    @Column({ type: 'int', nullable: true })
    recipientStaffId: number | null;
}
