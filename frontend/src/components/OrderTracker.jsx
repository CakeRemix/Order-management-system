/**
 * OrderTracker Component
 * Example implementation of order polling with UI
 */

import React from 'react';
import { useOrderPolling } from '../hooks/useOrderPolling';

const OrderTracker = ({ orderId }) => {
  const {
    status,
    loading,
    error,
    progress,
    interval,
    elapsedMinutes,
    isReceived,
    isPreparing,
    isReady,
    isCompleted,
    isCancelled,
    refetch,
    stop,
    resume
  } = useOrderPolling(orderId, {
    initialInterval: 2000,
    maxInterval: 30000,
    onStatusChange: (newStatus) => {
      console.log('Order status updated:', newStatus);
    },
    onComplete: (finalStatus) => {
      console.log('Order complete:', finalStatus);
    }
  });

  const getStatusColor = () => {
    if (isReceived) return '#FFA500'; // Orange
    if (isPreparing) return '#1E90FF'; // Blue
    if (isReady) return '#228B22'; // Green
    if (isCompleted) return '#32CD32'; // Light Green
    if (isCancelled) return '#DC143C'; // Crimson
    return '#808080'; // Gray
  };

  const getStatusMessage = () => {
    if (isReceived) return 'Order Received';
    if (isPreparing) return 'Preparing Your Order';
    if (isReady) return '✅ Order Ready for Pickup';
    if (isCompleted) return '✅ Order Completed';
    if (isCancelled) return '❌ Order Cancelled';
    return 'Unknown Status';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>
          Loading order status...
        </div>
        <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        <h3>Error Loading Order</h3>
        <p>{error}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Order #{orderId}</h2>
      
      {/* Status Display */}
      <div
        style={{
          padding: '15px',
          backgroundColor: getStatusColor(),
          color: 'white',
          borderRadius: '8px',
          marginBottom: '15px',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}
      >
        {getStatusMessage()}
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '15px' }}>
        <label>Progress: {Math.round(progress)}%</label>
        <progress
          value={progress}
          max="100"
          style={{
            width: '100%',
            height: '25px',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Status Details */}
      <div style={{ marginBottom: '15px', fontSize: '14px' }}>
        <p><strong>Current Status:</strong> {status?.status}</p>
        {status?.estimated_prep_time && (
          <p><strong>Est. Prep Time:</strong> {status.estimated_prep_time} minutes</p>
        )}
        <p><strong>Elapsed Time:</strong> {elapsedMinutes.toFixed(1)} minutes</p>
        <p><strong>Next Update In:</strong> {(interval / 1000).toFixed(1)}s</p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Last Updated: {new Date(status?.updated_at).toLocaleTimeString()}
        </p>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={refetch}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1E90FF',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Now
        </button>
        
        {!status?.isTerminal && (
          <>
            <button
              onClick={stop}
              style={{
                padding: '10px 20px',
                backgroundColor: '#FF6347',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Stop Polling
            </button>
            
            <button
              onClick={resume}
              style={{
                padding: '10px 20px',
                backgroundColor: '#228B22',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Resume Polling
            </button>
          </>
        )}
      </div>

      {/* Completion Message */}
      {status?.isTerminal && (
        <div
          style={{
            marginTop: '15px',
            padding: '15px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            textAlign: 'center'
          }}
        >
          <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {isCompleted ? '🎉 Thank you for your order!' : '😞 Your order was cancelled'}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTracker;
