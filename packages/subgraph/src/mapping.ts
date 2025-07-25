// import { ClicksAttributed, OwnershipSharesCalculated } from "../generated/ClickLub/ClickLub"
// import { Click, OwnershipShare } from "../generated/schema"
// import { store } from "@graphprotocol/graph-ts"

// Handler for ClicksAttributed event
export function handleClicksAttributed(event: any): void {
  // TODO: Replace "any" with generated type from graph-ts after codegen
  // const entity = new Click(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  // entity.buyer = event.params.buyer
  // entity.recipient = event.params.recipient
  // entity.amount = event.params.amount
  // entity.txHash = event.transaction.hash
  // entity.timestamp = event.block.timestamp
  // entity.save()
}

// Handler for OwnershipSharesCalculated event
export function handleOwnershipSharesCalculated(event: any): void {
  // TODO: Replace "any" with generated type from graph-ts after codegen
  // let entity = OwnershipShare.load(event.params.user)
  // if (!entity) {
  //   entity = new OwnershipShare(event.params.user)
  // }
  // entity.user = event.params.user
  // entity.shares = event.params.shares
  // entity.save()
}