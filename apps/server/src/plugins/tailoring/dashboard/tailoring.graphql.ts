import { graphql } from '@/gql';

/**
 * Typed documents for the tailoring Dashboard screens (`R-06`).
 */

export const tailoringJobListQuery = graphql(`
    query TailoringJobList($options: TailoringJobListOptions) {
        tailoringJobs(options: $options) {
            items {
                id
                createdAt
                updatedAt
                jobNumber
                serviceName
                orderId
                customerId
                assignedTailorId
                cancelledAt
                timeline {
                    currentStage
                    dueDate
                }
            }
            totalItems
        }
    }
`);

export const tailoringJobDetailQuery = graphql(`
    query TailoringJobDetail($id: ID!) {
        tailoringJob(id: $id) {
            id
            jobNumber
            serviceName
            orderId
            customerId
            assignedTailorId
            cancelledAt
            configuration {
                style
                fit
                fabric
                color
                lapel
                buttons
                lining
                monogram
                designNotes
            }
            timeline {
                currentStage
                dueDate
                stageTimestamps
                stageActorIds
                qualityControlPassed
                materialRequirements
            }
            fittings {
                id
                fittingType
                scheduledAt
                status
                location
            }
            measurementProfile {
                id
                unit
                measurements
                source
            }
        }
    }
`);

export const fittingListQuery = graphql(`
    query FittingList($options: FittingAppointmentListOptions) {
        fittings(options: $options) {
            items {
                id
                createdAt
                tailoringJobId
                fittingType
                scheduledAt
                durationMinutes
                status
                assignedTailorId
            }
            totalItems
        }
    }
`);
