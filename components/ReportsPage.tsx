import React, { useState, useMemo } from 'react';
import { Transaction, Item, TransactionType } from '../types';

interface ReportsPageProps {
  transactions: Transaction[];
  items: Item[];
}

const ReportsPage: React.FC < ReportsPageProps > = ({ transactions, items }) => {
  const [filterType, setFilterType] = useState('');
  const [filterItem, setFilterItem] = useState('');
  
  const getItemName = (itemId: string) => items.find(i => i.id === itemId)?.name || 'N/A';
  const getItemSku = (itemId: string) => items.find(i => i.id === itemId)?.sku || 'N/A';
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const typeMatch = filterType ? t.type === filterType : true;
      const itemMatch = filterItem ? t.itemId === filterItem : true;
      return typeMatch && itemMatch;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, filterType, filterItem]);
  
  return (
    <div className="reports-container">
      <h1 className="page-title">Informes de transacciones</h1>
      
      <div className="filters-container">
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="filter-select">
          <option value="">Todos los tipos de transacciones</option>
          {Object.values(TransactionType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select value={filterItem} onChange={e => setFilterItem(e.target.value)} className="filter-select">
          <option value="">Todos los artículos</option>
          {items.map(item => (
            <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="transactions-table">
          <thead className="table-header">
            <tr>
              <th className="table-head">Fecha y hora</th>
              <th className="table-head">Item</th>
              <th className="table-head">SKU</th>
              <th className="table-head">Tipo</th>
              <th className="table-head text-right">Cambio de cantidad</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredTransactions.map(t => (
              <tr key={t.id} className="table-row">
                <td className="table-cell">{new Date(t.timestamp).toLocaleString()}</td>
                <td className="table-cell item-name">{getItemName(t.itemId)}</td>
                <td className="table-cell sku">{getItemSku(t.itemId)}</td>
                <td className="table-cell">
                  <span className={`type-badge ${
                    t.type === TransactionType.INBOUND ? 'entrante' :
                    t.type === TransactionType.OUTBOUND ? 'salida' :
                    'ajuste'
                  }`}>
                    {t.type}
                  </span>
                </td>
                <td className={`table-cell quantity-change ${
                  t.quantityChange > 0 ? 'positive' : 'negative'
                }`}>
                  {t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .reports-container {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 25px;
          box-shadow: var(--shadow);
          border: 1px solid var(--glass-border);
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 25px;
          color: var(--dark);
        }

        .filters-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 25px;
        }

        .filter-select {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          background: white;
          font-size: 0.9rem;
          transition: var(--transition);
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(107, 0, 255, 0.1);
        }

        .table-container {
          overflow-x: auto;
          border-radius: 15px;
          background: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .transactions-table {
          width: 100%;
          border-collapse: collapse;
        }

        .table-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        }

        .table-head {
          padding: 15px 20px;
          text-align: left;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .text-right {
          text-align: right;
        }

        .table-body {
          background: white;
        }

        .table-row {
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          transition: var(--transition);
        }

        .table-row:hover {
          background: rgba(107, 0, 255, 0.02);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-cell {
          padding: 15px 20px;
          font-size: 0.9rem;
          color: var(--text);
        }

        .item-name {
          font-weight: 500;
          color: var(--dark);
        }

        .sku {
          font-family: monospace;
          font-size: 0.85rem;
          color: var(--text-light);
        }

        .type-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .type-badge.inbound {
          background: rgba(0, 200, 83, 0.1);
          color: var(--success);
        }

        .type-badge.outbound {
          background: rgba(244, 67, 54, 0.1);
          color: var(--danger);
        }

        .type-badge.adjustment {
          background: rgba(255, 152, 0, 0.1);
          color: var(--warning);
        }

        .quantity-change {
          font-weight: 700;
          font-size: 0.95rem;
        }

        .quantity-change.positive {
          color: var(--success);
        }

        .quantity-change.negative {
          color: var(--danger);
        }

        @media (max-width: 768px) {
          .reports-container {
            padding: 20px 15px;
            margin: 0 10px;
          }
          
          .filters-container {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          
          .table-head, .table-cell {
            padding: 10px 12px;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .table-container {
            font-size: 0.75rem;
          }
          
          .type-badge {
            padding: 4px 8px;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;