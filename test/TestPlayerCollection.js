const { assert } = require('chai')
const { expectRevert, expectEvent, BN } = require('@openzeppelin/test-helpers')
const PlayerCollection = artifacts.require('PlayerCollection.sol')

contract('PlayerCollection', (accounts) => {

    const [admin, guest, other] = accounts;
    let nft;
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const roleZAddress = '0x0000000000000000000000000000000000000000000000000000000000000000';


    before(async () => {
        nft = await PlayerCollection.new("Player NFT Collection", "OWNICPLAYER", "http://nebula-nft.test/meta")
    });

    beforeEach(async () => {
        // insert code fragment with will be used for refresh state after each test
    })

    it('should have name', async () => {
        return assert.equal('Player NFT Collection', await nft.name())
    })

    it('should have symbol', async () => {
        return assert.equal('OWNICPLAYER', await nft.symbol())
    })

    it('should have total supply value 0', async () => {
        const expectedSupply = await nft.totalSupply()
        assert.equal(expectedSupply, 0)
    })

    it('should not allow guest mint token without role', async () => {
        const tokenId = await nft.totalSupply()
        await expectRevert(
            nft.mint(guest, tokenId.toNumber() + 1, { from: guest }),
            'ERC721: must have minter role to mint'
        )
    })

    it('should not allow non-admin(guest) grant it\'s role', async () =>{
        const role = await nft.MINTER_ROLE()
        await expectRevert(
            nft.grantRole(role, guest, { from: guest }),
            `AccessControl: account ${guest.toLowerCase()} is missing role ${roleZAddress}`
        );
    })

    it('should admin grant guest minter role', async () => {
        const role = await nft.MINTER_ROLE()
        const expectedRoleGranted = await nft.grantRole(role, guest, {from: admin})
        expectEvent(expectedRoleGranted, 'RoleGranted', {
            role: role,
            account: guest,
            sender: admin,
        });
    })

    it('should granted guest mint token by specific ID=2', async () => {
        const expectedTransfer = await nft.mint(guest, 2, { from: guest});
        expectEvent(expectedTransfer, 'Transfer', {
            from: zeroAddress,
            to: guest,
        });
    })

    it('should have total supply value 1 after guest mints new token', async () => {
        const result = await nft.totalSupply()
        assert.equal(result, 1)
    })

    it('should not allow minter guest mint token by already used ID=2', async () => {
        await expectRevert(
            nft.mint(guest, 2, { from: guest}),
            'ERC721: token already minted'
        );
    })

    it('should guest mint token by total supply value = 1 ==> id-1 not used', async () => {
        const tokenId = await nft.totalSupply()
        const expectedTransfer = await nft.mint(guest, tokenId.toNumber(), {
            from: guest,
        })
        expectEvent(expectedTransfer, 'Transfer', {
            from: zeroAddress,
            to: guest,
        })
    })

    it('should have total supply value 2 after guest mints new token', async () => {
        const result = await nft.totalSupply()
        assert.equal(result, 2)
    })

    it('should admin mint token by specific ID=3', async () => {
        const expectedTransfer = await nft.mint(admin, 3, {
            from: admin,
        })
        expectEvent(expectedTransfer, 'Transfer', {
            from: zeroAddress,
            to: admin,
        })
    })

    it('should have total supply value 3 after admin mints new token', async () => {
        const expectedSupply = await nft.totalSupply()
        assert.equal(expectedSupply, 3)
    })

    it('should not allow guest burn admin\'s token', async () => {
        await expectRevert(
            nft.burn(3,{from : guest}),
            'ERC721Burnable: caller is not owner nor approved'
        );
    })

    it('should not allow admin burn guest\'s token', async () => {
        await expectRevert(
                nft.burn(2,{from : admin}),
                'ERC721Burnable: caller is not owner nor approved'
            );
    })

    it('should not allow guest burn nonexistent token', async () => {
        await expectRevert(
            nft.burn(10,{from : guest}),
            'ERC721: operator query for nonexistent token'
        );
    })

    it('should allow guest burn it\'s token tokenId=1 ', async () => {
        const expectedTransfer = await nft.burn(1,{from : guest});
        expectEvent(expectedTransfer, 'Transfer', {
            from : guest,
            to: zeroAddress,
        })
    })

    it('should have total supply value 2 after guest burn it\'s token', async () => {
        const expectedSupply = await nft.totalSupply()
        assert.equal(expectedSupply, 2)
    })

    it('should allow admin burn it\'s token tokenId=3', async () => {
        const expectedTransfer = await nft.burn(3,{from : admin});
        expectEvent(expectedTransfer, 'Transfer', {
            from : admin,
            to: zeroAddress,
        })
    })

    it('should have total supply value 1 after admin burn it\'s token', async () => {
        const expectedSupply = await nft.totalSupply()
        assert.equal(expectedSupply, 1)
    })

    it('should admin mint token by specific ID=10', async () => {
        const expectedTransfer = await nft.mint(admin, 10, {
            from: admin,
        })
        expectEvent(expectedTransfer, 'Transfer', {
            from: zeroAddress,
            to: admin,
        })
    })

    it('should have total supply value 2 after admin mints new token', async () => {
        const result = await nft.totalSupply()
        assert.equal(result, 2)
    })

    it('should admin give guest approval on it\'s token ', async () => {
        const expectedApproval = await nft.approve(guest, 10, {from: admin})
        expectEvent(expectedApproval, 'Approval', {
            owner : admin,
            approved : guest,
            tokenId: new BN(10)
        })
    })

    it('should not allow guest give approval to other on admin\'s token', async () => {
        await expectRevert(
            nft.approve(other, 10 , { from: guest }),
            'ERC721: approve caller is not owner nor approved for all'
        );
    })

    it('should allow approved guest transfer admin\'s token to other', async () =>{
        const result = await nft.transferFrom(admin, other, 10 , { from: guest })
        expectEvent(result, 'Transfer', {
            from : admin,
            to: other,
        })
    })

    it('should not allow admin burn it\'s token after guest transfer it to other tokenId=10', async  () => {
        await expectRevert(
            nft.burn(10, { from : admin}),
            'ERC721Burnable: caller is not owner nor approved'
        );
    })

    it('should other transfer back to guest it\'s token ownership tokenId=10', async () => {
        const result = await nft.transferFrom(other, guest, 10 , { from: other })
        expectEvent(result, 'Transfer', {
            from : other,
            to: guest,
        })
    })

    it('should allow guest burn it\'s token tokenId=10', async () => {
        const expectedTransfer = await nft.burn(10,{from : guest});
        expectEvent(expectedTransfer, 'Transfer', {
            from : guest,
            to: zeroAddress,
        })
    })

    it('should have total supply value 1 after admin mints new token', async () => {
        const result = await nft.totalSupply()
        assert.equal(result, 1)
    })

    it('should admin mint token by specific ID=10', async () => {
        const expectedTransfer = await nft.mint(admin, 10, {
            from: admin,
        })
        expectEvent(expectedTransfer, 'Transfer', {
            from: zeroAddress,
            to: admin,
        })
    })

    it('should have total supply value 2 after admin mints new token', async () => {
        const result = await nft.totalSupply()
        assert.equal(result, 2)
    })

    it('should admin give approval to guest on it\'s token', async () => {
        const expectedApproval = await nft.approve(guest, 10, {from: admin})
        expectEvent(expectedApproval, 'Approval', {
            owner : admin,
            approved : guest,
            tokenId: new BN(10)
        })
    })

    /* guest lost approval on the admin's token */
    it('should admin give approval to other on the same token ', async () => {
        const expectedApproval = await nft.approve(other, 10, {from: admin})
        expectEvent(expectedApproval, 'Approval', {
            owner : admin,
            approved : other,
            tokenId: new BN(10)
        })
    })

    it('should not allow guest give to other admin\'s token ownership', async () => {
        await expectRevert(
            nft.transferFrom(guest, other, 10 , { from: guest }),
            'ERC721: transfer caller is not owner nor approved'
        );
    })

    it('should admin mint token by specific ID=11', async () => {
        const expectedTransfer = await nft.mint(admin, 11, {
            from: admin,
        })
        expectEvent(expectedTransfer, 'Transfer', {
            from: zeroAddress,
            to: admin,
        })
    })

    it('should have total supply value 3 after admin mints new token', async () => {
        const result = await nft.totalSupply()
        assert.equal(result, 3)
    })

    it('should admin give approval to guest on it\'s token tokenId=11', async () => {
        const expectedApproval = await nft.approve(guest, 11, {from: admin})
        expectEvent(expectedApproval, 'Approval', {
            owner : admin,
            approved : guest,
            tokenId: new BN(11)
        })
    })

    it('should allow approved other give ownership to guest on admin\'s token tokenId=10', async () => {
        const result = await nft.transferFrom(admin, guest, 10 , { from: other })
        expectEvent(result, 'Transfer', {
            from : admin,
            to: guest,
        })
    })

    it('should allow approved guest give ownership to other on admin\'s token tokenId=11', async () => {
        const result = await nft.transferFrom(admin, other, 11 , { from: guest })
        expectEvent(result, 'Transfer', {
            from : admin,
            to: other,
        })
    })

    it('should not allow admin burn it\'s token after other transfer it to guest tokenId=10', async  () => {
        await expectRevert(
            nft.burn(10, { from : admin}),
            'ERC721Burnable: caller is not owner nor approved'
        );
    })

    it('should not allow admin burn it\'s token after guest transfer it to other tokenId=11', async  () => {
        await expectRevert(
            nft.burn(11, { from : admin}),
            'ERC721Burnable: caller is not owner nor approved'
        );
    })

    it('should allow guest burn it\'s token tokenId=10', async () => {
        const expectedTransfer = await nft.burn(10,{from : guest});
        expectEvent(expectedTransfer, 'Transfer', {
            from : guest,
            to: zeroAddress,
        })
    })

    it('should have total supply value 2 after guest burn it\'s token', async () => {
        const result = await nft.totalSupply()
        assert.equal(result, 2)
    })

    it('should allow other burn it\'s token tokenId=11', async () => {
        const expectedTransfer = await nft.burn(11,{from : other});
        expectEvent(expectedTransfer, 'Transfer', {
            from : other,
            to: zeroAddress,
        })
    })

    it('should have total supply value 1 after other burn it\'s token', async () => {
        const result = await nft.totalSupply()
        assert.equal(result, 1)
    })

    it('should allow guest burn it\'s token tokenId=2', async () => {
        const expectedTransfer = await nft.burn(2,{from : guest});
        expectEvent(expectedTransfer, 'Transfer', {
            from : guest,
            to: zeroAddress,
        })
    })

    it('should have total supply value 0 after guest burn it\'s token', async () => {
        const result = await nft.totalSupply()
        assert.equal(result, 0)
    })

})
