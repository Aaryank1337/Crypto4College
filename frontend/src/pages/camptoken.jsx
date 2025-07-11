import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/BlockchainContext';
import { useWallet } from '../context/WalletContext';
import { 
  TrendingUp, 
  Wallet, 
  Coins, 
  Award, 
  CreditCard, 
  Vote,
  Loader
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import Tokens from '../components/Tokens';
import NFTs from '../components/NFTs';
import DAO from '../components/DAO';
import EventManagement from '../components/EventManagement';
import FeePayment from '../components/Fees'; // Import the FeePayment component

const CampusXChainApp = () => {
  const {
    account,
    campToken,
    campusDAO,
    feeManager,
    eventNFT,
    isInitialized,
    airdropTokens,
    transferTokens,
    payFees,
    mintPOAP,
    createProposal,
    vote,
    getUserNFTs,
    getPaymentStatus
  } = useWeb3();

  const { isConnected, connectWallet } = useWallet();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campBalance, setCampBalance] = useState('0');
  const [userNFTs, setUserNFTs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState({ isPaid: false, amount: '0' });
  const [loading, setLoading] = useState(false);
  const [proposalCount, setProposalCount] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (account && isInitialized) {
      fetchUserData();
    }
  }, [account, isInitialized]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      if (campToken && account) {
        const owner = await campToken.owner();
        setIsOwner(owner.toLowerCase() === account.toLowerCase());
        
        const balance = await campToken.balanceOf(account);
        const formattedBalance = (Number(balance) / 1e18).toFixed(2);
        setCampBalance(formattedBalance);
      }
      
      if (eventNFT && account) {
        const nfts = await getUserNFTs(account);
        setUserNFTs(Array.isArray(nfts) ? nfts : []);
      }
      
      if (feeManager && account && getPaymentStatus) {
        try {
          const [isPaid, paidAmount] = await getPaymentStatus(account);
          setPaymentStatus({
            isPaid,
            amount: paidAmount ? (Number(paidAmount) / 1e18).toFixed(2) : '0'
          });
        } catch (error) {
          console.error('Error fetching payment status:', error);
          setPaymentStatus({ isPaid: false, amount: '0' });
        }
      }

      if (campusDAO) {
        await fetchProposals();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const fetchedProposals = [];
      
      const count = await campusDAO.proposalCount();
      const proposalCount = Number(count);
      setProposalCount(proposalCount);

      for (let i = proposalCount - 1; i >= 0; i--) {
        try {
          const proposal = await campusDAO.proposals(i);
          if (proposal && proposal.description) {
            fetchedProposals.push({
              id: i,
              description: proposal.description,
              forVotes: Number(proposal.forVotes),
              againstVotes: Number(proposal.againstVotes),
              abstainVotes: Number(proposal.abstainVotes),
              deadline: Number(proposal.deadline),
              executed: proposal.executed,
              creator: proposal.creator
            });
          }
        } catch (error) {
          console.log(`Error fetching proposal ${i}:`, error.message);
        }
      }
      
      setProposals(fetchedProposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800/70 hover:border-purple-500/30 border border-transparent'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (!isInitialized) {
    return (
      <>
        <Navbar/>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Initializing Web3...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 pt-16">
        {!isConnected && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 shadow-2xl shadow-purple-900/20">
              <div className="text-center">
                <p className="text-gray-300 mb-4">Please connect your wallet to use the application</p>
                <button 
                  onClick={connectWallet}
                  className="bg-gradient-to-br from-purple-700 to-purple-800 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-700/25"
                >
                  <Wallet className="w-4 h-4 inline mr-2" />
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        )}

        {isConnected && account && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
            <div className="bg-gray-900/70 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 shadow-2xl shadow-purple-900/20">
              <h3 className="text-white text-lg font-semibold mb-4">Wallet Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className="text-purple-400 text-2xl font-bold">
                    {formatAddress(account)}
                  </div>
                  <div className="text-gray-400 text-sm">Wallet Address</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className="text-blue-400 text-2xl font-bold">
                    {loading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : `${campBalance} CAMP`}
                  </div>
                  <div className="text-gray-400 text-sm">Token Balance</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className={`text-2xl font-bold ${paymentStatus.isPaid ? 'text-green-400' : 'text-red-400'}`}>
                    {loading ? (
                      <Loader className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      paymentStatus.isPaid ? `Paid (${paymentStatus.amount} CAMP)` : 'Not Paid'
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">Fee Status</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isConnected && account && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="flex flex-wrap gap-2 mb-8 p-2 bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/30">
              <TabButton id="dashboard" label="Dashboard" icon={TrendingUp} active={activeTab === 'dashboard'} onClick={setActiveTab} />
              <TabButton id="tokens" label="Tokens" icon={Coins} active={activeTab === 'tokens'} onClick={setActiveTab} />
              <TabButton id="nfts" label="NFTs" icon={Award} active={activeTab === 'nfts'} onClick={setActiveTab} />
              <TabButton id="fees" label="Fees" icon={CreditCard} active={activeTab === 'fees'} onClick={setActiveTab} />
              <TabButton id="dao" label="DAO" icon={Vote} active={activeTab === 'dao'} onClick={setActiveTab} />
              <TabButton id="event" label="Event" icon={Vote} active={activeTab === 'event'} onClick={setActiveTab} />
            </div>

            <div className="space-y-8">
              {activeTab === 'dashboard' && (
                <Dashboard 
                  campBalance={campBalance}
                  userNFTs={userNFTs}
                  paymentStatus={paymentStatus}
                  proposalCount={proposalCount}
                  loading={loading}
                />
              )}

              {activeTab === 'tokens' && (
                <Tokens 
                  airdropTokens={airdropTokens}
                  transferTokens={transferTokens}
                  fetchUserData={fetchUserData}
                  loading={loading}
                  setLoading={setLoading}
                  isOwner={isOwner}
                />
              )}

              {activeTab === 'fees' && (
                
                  <div className="max-w-2xl mx-auto">
                    <FeePayment onPaymentSuccess={fetchUserData} />
                  </div>
                
              )}

              {activeTab === 'nfts' && (
                <NFTs 
                  mintPOAP={mintPOAP}
                  userNFTs={userNFTs}
                  fetchUserData={fetchUserData}
                  loading={loading}
                  setLoading={setLoading}
                />
              )}

              {activeTab === 'dao' && (
                <DAO />
              )}
              
              {activeTab === 'event' && (
                <EventManagement 
                  isOwner={isOwner}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CampusXChainApp;